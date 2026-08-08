// this file uses formatted cookies to store the user's role for middleware access control, so that we can protect /admin, /driver, /customer routes on the server side (Edge) without needing to fetch the full user profile from Firestore. The cookie is set after login and cleared on logout. It is not a security measure, just a convenience for routing.
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth }       from '@/lib/firebase';
import { getUser, setUser } from '@/lib/firestore';
import type { User }  from '@/types';

interface AuthContextType {
  user:          User | null;
  loading:       boolean;
  login:         (email: string, password: string) => Promise<void>;
  register:      (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout:        () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Cookie helpers (so middleware can read role) ──────────────────────────────
function setCookie(name: string, value: string, days = 7) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${exp};path=/;SameSite=Strict`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUserState] = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUser(firebaseUser.uid);
          if (profile) {
            setUserState(profile);
            setCookie('dom_role', profile.role); // for middleware
          } else {
            setUserState(null);
            deleteCookie('dom_role');
          }
        } catch {
          setUserState(null);
          deleteCookie('dom_role');
        }
      } else {
        setUserState(null);
        deleteCookie('dom_role');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred    = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUser(cred.user.uid);
    if (!profile) throw new Error('User profile not found. Contact admin.');
    setUserState(profile);
    setCookie('dom_role', profile.role);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const cred    = await createUserWithEmailAndPassword(auth, email, password);
    const profile: User = {
      uid:       cred.user.uid,
      username:  name,
      email,
      phone,
      address:   '',
      role:      'customer',
      createdAt: new Date().toISOString(),
    };
    await setUser(profile);
    setUserState(profile);
    setCookie('dom_role', 'customer');
  };

  // Sends a password reset link to the given email via Firebase Auth's own
  // hosted flow — no email service of our own needed. Firebase silently
  // no-ops on unknown addresses too (privacy: doesn't reveal which emails
  // are registered), so we always show the same "check your email" message.
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Google sign-in — only ever creates/logs into a 'customer' account, matching
  // the existing self-registration flow (drivers/employees/admins are always
  // created by an admin, never via self-service signup of any kind).
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred     = await signInWithPopup(auth, provider);
    let profile    = await getUser(cred.user.uid);

    if (!profile) {
      profile = {
        uid:       cred.user.uid,
        username:  cred.user.displayName || cred.user.email?.split('@')[0] || 'Customer',
        email:     cred.user.email || '',
        phone:     '',
        address:   '',
        role:      'customer',
        createdAt: new Date().toISOString(),
      };
      await setUser(profile);
    }

    if (profile.role !== 'customer') {
      await signOut(auth);
      throw new Error('This Google account is not registered as a customer. Staff accounts must be created by an admin.');
    }

    setUserState(profile);
    setCookie('dom_role', profile.role);
  };

  const logout = async () => {
    await signOut(auth);
    setUserState(null);
    deleteCookie('dom_role');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}