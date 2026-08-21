"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api, setToken } from "@/lib/api-client";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;

  loginGoogle: (
    idToken: string
  ) => Promise<void>;

  loginGuest: () => Promise<void>;

  logout: () => Promise<void>;

  refetchUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [user, setUser] = useState<any>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  async function fetchProfile() {
    try {
      const res = await api.get("/auth/me", {
        withCredentials: true,
      });

      setUser(res.data);

      return res.data;
    } catch {
      setUser(null);
      setIsAuthenticated(false);

      throw new Error(
        "Failed to fetch profile"
      );
    }
  }

  /**
   * Restore authentication after a full page refresh.
   *
   * The access token lives in memory.
   * The refresh_token cookie restores it.
   */
  useEffect(() => {
    api
      .post(
        "/auth/refresh",
        {},
        {
          withCredentials: true,
        }
      )
      .then(async (res) => {
        const accessToken =
          res.data.accessToken;

        if (!accessToken) {
          throw new Error(
            "Refresh response did not contain an access token."
          );
        }

        setToken(accessToken);

        const profile =
          await fetchProfile();

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

  /**
   * Google login.
   */
  const loginGoogle = async (
    idToken: string
  ) => {
    const res = await api.post(
      "/auth/google",
      { idToken },
      {
        withCredentials: true,
      }
    );

    const accessToken =
      res.data.accessToken;

    if (!accessToken) {
      throw new Error(
        "Google login did not return an access token."
      );
    }

    setToken(accessToken);

    const profile =
      await fetchProfile();

    setIsAuthenticated(true);
    setUser(profile);
  };

  /**
   * Guest login.
   */
  const loginGuest = async () => {
    const res = await api.post(
      "/auth/guest",
      {},
      {
        withCredentials: true,
      }
    );

    const accessToken =
      res.data.accessToken;

    if (!accessToken) {
      throw new Error(
        "Guest login did not return an access token."
      );
    }

    setToken(accessToken);

    const profile =
      await fetchProfile();

    setIsAuthenticated(true);
    setUser(profile);
  };

  /**
   * Logout.
   */
  const logout = async () => {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } finally {
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refetchUser = async () => {
    const profile =
      await fetchProfile();

    setIsAuthenticated(true);
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginGoogle,
        loginGuest,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}
