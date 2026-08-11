import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const BASE = import.meta.env.BASE_URL;

export interface AuthUser {
  email: string;
  name: string;
  picture: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  /** True while the sign-in reminder dialog is open */
  promptOpen: boolean;
  /** Show a friendly "sign in with Google" reminder (e.g. gated action attempted) */
  promptLogin: () => void;
  closePrompt: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    fetch(`${BASE}api/auth/me`, { credentials: 'include' })
      .then(async (r) => (r.ok ? ((await r.json()) as AuthUser) : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = `${BASE}api/auth/google`;
  };

  const logout = async () => {
    await fetch(`${BASE}api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        promptOpen,
        promptLogin: () => setPromptOpen(true),
        closePrompt: () => setPromptOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
