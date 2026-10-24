import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, clearToken, getToken, saveToken } from "../services/api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null; loading: boolean; error: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void; setError: (message: string) => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => { clearToken(); setUser(null); }).finally(() => setLoading(false));
  }, []);

  async function authenticate(action: () => ReturnType<typeof api.login>) {
    setError("");
    const result = await action();
    saveToken(result.access_token);
    setUser(result.user);
  }
  const value = useMemo<AuthContextValue>(() => ({
    user, loading, error, setError,
    login: (email, password) => authenticate(() => api.login(email, password)),
    signup: (email, password) => authenticate(() => api.signup(email, password)),
    logout: () => { clearToken(); setUser(null); setError(""); },
  }), [user, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
