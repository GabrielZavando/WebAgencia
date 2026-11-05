import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || 'dummy-api-key-for-tests',
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || '1:000000000:web:dummy',
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-DUMMY',
};

// Solo inicializar Firebase si las variables están configuradas (no en tests)
let auth: ReturnType<typeof getAuth> | null = null;

if (import.meta.env.PUBLIC_FIREBASE_API_KEY && import.meta.env.PUBLIC_FIREBASE_API_KEY !== 'dummy-api-key-for-tests') {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

// Conectar al emulador de Firebase Auth en desarrollo local (opcional)
// Descomentar si se usa Firebase emulador
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export { auth };