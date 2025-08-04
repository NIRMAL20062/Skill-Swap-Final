// src/lib/auth.ts
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { app } from "./firebase";
import { createUserProfile, getUserProfile, ADMIN_EMAIL } from "./firestore";
import { FirebaseError } from "firebase/app";

export const auth = getAuth(app);

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const existingMethods = await fetchSignInMethodsForEmail(auth, email);
  if (existingMethods.length > 0) {
    throw new FirebaseError('auth/email-already-in-use', 'This email is already associated with an account. Please log in.');
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);

  const isAdmin = userCredential.user.email === ADMIN_EMAIL;
  
  await createUserProfile(userCredential.user.uid, {
    email: userCredential.user.email!,
    displayName: fullName,
    admin: isAdmin,
  });
  return userCredential;
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const provider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    const isAdmin = user.email === ADMIN_EMAIL;
    await createUserProfile(user.uid, {
      email: user.email!,
      displayName: user.displayName || 'New User',
      photoURL: user.photoURL || undefined,
      admin: isAdmin,
    });
  }
  return result;
};

export const sendPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};
