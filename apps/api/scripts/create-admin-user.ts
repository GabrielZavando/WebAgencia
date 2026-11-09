import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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

export async function createAdminUser(input: CreateAdminUserInput): Promise<string> {
  initializeFirebaseAdmin();

  const userRecord = await getAuth().createUser({
    email: input.email,
    password: input.password,
  });

  console.log(`Admin user created: ${userRecord.uid} (${userRecord.email})`);

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
