import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  authStorage,
  getCurrentSession,
  signInWithEmail,
  signUpWithEmail,
  registerSession,
  updateProfileData,
  updateSettingsData,
  signOutSession,
  type AuthUser,
  type UserProfile,
  type UserSettings,
} from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setUser(session.user);
      setProfile(session.profile);
      setSettings(session.settings);
    }
    setLoading(false);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === authStorage.SESSION_KEY || e.key === authStorage.ACCOUNTS_KEY) {
        const refreshed = getCurrentSession();
        if (refreshed) {
          setUser(refreshed.user);
          setProfile(refreshed.profile);
          setSettings(refreshed.settings);
        } else {
          setUser(null);
          setProfile(null);
          setSettings(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    settings,
    loading,
    signIn: async (email, password, remember) => {
      const session = await signInWithEmail(email, password, remember);
      registerSession(session);
      setUser(session.user);
      setProfile(session.profile);
      setSettings(session.settings);
    },
    signUp: async (email, password, fullName) => {
      const session = await signUpWithEmail(email, password, fullName);
      registerSession(session);
      setUser(session.user);
      setProfile(session.profile);
      setSettings(session.settings);
    },
    signOut: () => {
      signOutSession();
      setUser(null);
      setProfile(null);
      setSettings(null);
    },
    updateProfile: (updates) => {
      if (!user) return;
      const next = updateProfileData(user.id, updates);
      setProfile(next);
    },
    updateSettings: (updates) => {
      if (!user) return;
      const next = updateSettingsData(user.id, updates);
      setSettings(next);
    },
  }), [user, profile, settings, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
