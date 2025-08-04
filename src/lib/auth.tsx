// src/lib/auth.tsx
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
  fetchSignInMethodsForEmail,
  type User,
} from "firebase/auth";
import { app } from "./firebase";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  return useContext(AuthContext);
};
