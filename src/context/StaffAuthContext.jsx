import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { isUserStaff, getStaffProfile } from '../firebase/services';

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [staffProfile, setStaffProfile] = useState(null);
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
          const staff = await Promise.race([
            isUserStaff(u.uid),
            new Promise((resolve) => { setTimeout(() => resolve(false), 8000); }),
          ]);
          setIsStaff(staff);
          if (staff) {
            const profile = await getStaffProfile(u.uid);
            setStaffProfile(profile);
          } else {
            setStaffProfile(null);
          }
        } else {
          setIsStaff(false);
          setStaffProfile(null);
        }
      } catch {
        setIsStaff(false);
        setStaffProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const staff = await isUserStaff(cred.user.uid);
    if (!staff) {
      await signOut(auth);
      throw new Error('You do not have staff access. Ask admin to add you in Firebase.');
    }
    return cred.user;
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  return (
    <StaffAuthContext.Provider value={{
      user, isStaff, staffProfile, loading, login, logout, isFirebaseConfigured,
    }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffAuth must be used within StaffAuthProvider');
  return ctx;
}
