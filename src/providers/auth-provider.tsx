"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api, setToken } from "@/lib/api-client";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: any; // will be the full profile from /auth/me
  isLoading: boolean;
  loginGoogle: (idToken: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      throw new Error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    // Attempt silent refresh on mount
    api.post("/auth/refresh")
      .then(async (res) => {
        setToken(res.data.accessToken);
        const profile = await fetchProfile();
        setIsAuthenticated(true);
        setUser(profile);
      })
      .catch(() => {
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loginGoogle = async (idToken: string) => {
    const res = await api.post("/auth/google", { idToken });
    setToken(res.data.accessToken);
    const profile = await fetchProfile();
    setIsAuthenticated(true);
    setUser(profile);
  };

  const loginGuest = async () => {
    const res = await api.post("/auth/guest");
    setToken(res.data.accessToken);
    const profile = await fetchProfile();
    setIsAuthenticated(true);
    setUser(profile);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, loginGoogle, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
