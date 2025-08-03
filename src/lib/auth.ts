// src/lib/auth.ts
"use client";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { app } from "./firebase";
import { useState, useEffect } from "react";
import { createUserProfile, getUserProfile } from "./firestore";

export const auth = getAuth(app);

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await createUserProfile(userCredential.user.uid, {
    email: userCredential.user.email!,
    displayName: fullName,
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
  
  // Check if the user already exists in Firestore
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    // New user, create a profile
    await createUserProfile(user.uid, {
      email: user.email!,
      displayName: user.displayName || 'Google User',
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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};