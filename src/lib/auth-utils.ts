import { signInWithEmailAndPassword, type User } from "firebase/auth";
import { auth } from "./firebase/client";

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function getCurrentToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = auth.currentUser;
    if (user) {
      user.getIdToken().then(resolve).catch(() => resolve(null));
    } else {
      resolve(null);
    }
  });
}
