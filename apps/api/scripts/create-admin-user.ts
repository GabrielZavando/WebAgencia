import * as dotenv from 'dotenv';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load the API environment so the script can run outside the Nest bootstrap.
// The path is resolved relative to this file so it works from any working directory.
dotenv.config({ path: join(__dirname, '..', '.env') });

interface CreateAdminUserInput {
  email: string;
  password: string;
}

function initializeFirebaseAdmin(): void {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin configuration is incomplete. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.',
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
}

function isEmailAlreadyExists(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'auth/email-already-exists'
  );
}

/**
 * Ensures the Firestore `users` profile carries the `admin` role. Without it the
 * API provisions the profile as `editor` on first login and the admin panel
 * rejects the session because `user.role !== 'admin'`.
 */
async function ensureAdminProfile(user: UserRecord, email: string): Promise<string> {
  const firestore = getFirestore();
  const usersRef = firestore.collection('users');
  const timestamp = new Date().toISOString();

  const existing = await usersRef.where('email', '==', email).limit(1).get();

  if (existing.empty) {
    const created = await usersRef.add({
      email,
      full_name: user.displayName ?? '',
      role: 'admin',
      avatar_url: null,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    });

    return created.id;
  }

  const profile = existing.docs[0];
  await profile.ref.update({ role: 'admin', is_active: true, updated_at: timestamp });

  return profile.id;
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<string> {
  initializeFirebaseAdmin();
  const auth = getAuth();

  let userRecord: UserRecord;

  try {
    userRecord = await auth.createUser({
      email: input.email,
      password: input.password,
    });
  } catch (error: unknown) {
    if (!isEmailAlreadyExists(error)) throw error;

    // Keep the script idempotent: reuse the account and align its password.
    userRecord = await auth.getUserByEmail(input.email);
    await auth.updateUser(userRecord.uid, { password: input.password });
  }

  const profileId = await ensureAdminProfile(userRecord, input.email);

  console.log(`Admin user created: ${userRecord.uid} (${userRecord.email})`);
  console.log(`Admin profile role: admin (users/${profileId})`);

  return userRecord.uid;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith('--email='));
  const passwordArg = args.find((a) => a.startsWith('--password='));

  const email = emailArg ? emailArg.split('=')[1] : process.env.ADMIN_EMAIL;
  const password = passwordArg ? passwordArg.split('=')[1] : process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Usage: npx ts-node scripts/create-admin-user.ts --email=<email> --password=<password>');
    console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    process.exit(1);
  }

  try {
    await createAdminUser({ email, password });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to create admin user: ${error.message}`);

      // The Firebase Admin SDK hides this cause behind a generic message when
      // the project has no Authentication configuration provisioned yet.
      if (/no configuration corresponding|CONFIGURATION_NOT_FOUND/i.test(error.message)) {
        console.error('');
        console.error('Firebase Authentication is not enabled for this project.');
        console.error(
          'Enable it in the Firebase Console: Authentication -> Sign-in method -> Email/Password -> Enable.',
        );
      }
    } else {
      console.error('Failed to create admin user: unknown error');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    process.exit(1);
  });
}
