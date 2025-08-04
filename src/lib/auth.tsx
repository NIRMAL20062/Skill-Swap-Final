// src/lib/auth.tsx
"use client";

import { auth } from "./auth";
import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
            if (user && !user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
                setUser(null);
            } else {
                setUser(user);
            }
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