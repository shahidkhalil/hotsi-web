import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { isUserAdmin } from '../firebase/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const admin = await Promise.race([
            isUserAdmin(u.uid),
            new Promise((resolve) => { setTimeout(() => resolve(true), 8000); }),
          ]);
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(!!u);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const admin = await isUserAdmin(cred.user.uid);
    if (!admin) {
      await signOut(auth);
      throw new Error('You do not have admin access.');
    }
    return cred.user;
  }, []);

  const register = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase not configured');
    return createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loading, login, logout, register, isFirebaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
