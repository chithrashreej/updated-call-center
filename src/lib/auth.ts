/**
 * Demo authentication library for OnGround.ai Call Centre.
 *
 * LIMITATIONS (read before production use):
 *  - This is a DEMO auth mechanism. Credentials and sessions are stored in
 *    browser LocalStorage, which is NOT production-secure.
 *  - Passwords are hashed with a simple non-cryptographic hash for demo
 *    purposes only. Do NOT use this approach in production.
 *  - Any user with access to the browser can read or modify stored sessions.
 *  - For production, replace this with Supabase Auth or another real auth
 *    provider. The AuthContext interface is designed to be swappable.
 *
 * Default demo account:
 *   Email:    ava@ongroundai.com
 *   Password: onground123
 */

const DEMO_SEED = {
  id: 'usr_ava',
  email: 'ava@ongroundai.com',
  password: 'onground123',
  fullName: 'Ava Rep',
  phone: '+1 (555) 014-2278',
  jobTitle: 'Senior Account Executive',
  department: 'Inside Sales',
};

export interface AuthUser {
  id: string;
  email: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  compactMode: boolean;
  autoArchiveCalls: boolean;
}

interface StoredAccount extends AuthUser {
  passwordHash: string;
  profile: UserProfile;
  settings: UserSettings;
}

interface Session {
  user: AuthUser;
  profile: UserProfile;
  settings: UserSettings;
}

export const authStorage = {
  ACCOUNTS_KEY: 'onground_accounts_v1',
  SESSION_KEY: 'onground_session_v1',
};

// Simple non-cryptographic hash — DEMO ONLY.
function demoHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return `h_${h}`;
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(authStorage.ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(authStorage.ACCOUNTS_KEY, JSON.stringify(accounts));
}

function ensureSeed() {
  const accounts = loadAccounts();
  if (!accounts.some((a) => a.id === DEMO_SEED.id)) {
    accounts.push({
      id: DEMO_SEED.id,
      email: DEMO_SEED.email,
      passwordHash: demoHash(DEMO_SEED.password),
      profile: {
        fullName: DEMO_SEED.fullName,
        email: DEMO_SEED.email,
        phone: DEMO_SEED.phone,
        jobTitle: DEMO_SEED.jobTitle,
        department: DEMO_SEED.department,
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: false,
        compactMode: false,
        autoArchiveCalls: true,
      },
    });
    saveAccounts(accounts);
  }
}

function defaultSessionKey(): string {
  return authStorage.SESSION_KEY;
}

export function getCurrentSession(): Session | null {
  ensureSeed();
  try {
    const raw = localStorage.getItem(defaultSessionKey());
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string, remember: boolean): Promise<Session> {
  ensureSeed();
  await new Promise((r) => setTimeout(r, 350));
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.passwordHash !== demoHash(password)) {
    throw new Error('Invalid email or password. Try ava@ongroundai.com / onground123');
  }
  const session: Session = {
    user: { id: account.id, email: account.email },
    profile: account.profile,
    settings: account.settings,
  };
  if (!remember) {
    sessionStorage.setItem(defaultSessionKey(), JSON.stringify(session));
  }
  return session;
}

export function registerSession(session: Session) {
  localStorage.setItem(defaultSessionKey(), JSON.stringify(session));
}

export function signOutSession() {
  localStorage.removeItem(defaultSessionKey());
  sessionStorage.removeItem(defaultSessionKey());
}

export function updateProfileData(userId: string, updates: Partial<UserProfile>): UserProfile {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === userId);
  if (!account) throw new Error('Account not found');
  account.profile = { ...account.profile, ...updates };
  if (updates.email) account.email = updates.email;
  saveAccounts(accounts);
  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    const updated = { ...session, profile: account.profile, user: { ...session.user, email: account.email } };
    registerSession(updated);
  }
  return account.profile;
}

export function updateSettingsData(userId: string, updates: Partial<UserSettings>): UserSettings {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === userId);
  if (!account) throw new Error('Account not found');
  account.settings = { ...account.settings, ...updates };
  saveAccounts(accounts);
  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    registerSession({ ...session, settings: account.settings });
  }
  return account.settings;
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<Session> {
  ensureSeed();
  await new Promise((r) => setTimeout(r, 400));
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) throw new Error('Email and password are required.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const accounts = loadAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }
  const newAccount: StoredAccount = {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    email: trimmedEmail,
    passwordHash: demoHash(password),
    profile: {
      fullName: fullName.trim() || 'New User',
      email: trimmedEmail,
      phone: '',
      jobTitle: 'Sales Representative',
      department: 'Inside Sales',
    },
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      compactMode: false,
      autoArchiveCalls: true,
    },
  };
  accounts.push(newAccount);
  saveAccounts(accounts);
  return {
    user: { id: newAccount.id, email: newAccount.email },
    profile: newAccount.profile,
    settings: newAccount.settings,
  };
}

export const DEMO_CREDENTIALS = {
  email: DEMO_SEED.email,
  password: DEMO_SEED.password,
};
