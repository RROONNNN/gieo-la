"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SafeUser } from "@/types/user";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerMemberApi,
  registerNgoApi,
  registerIndividualApi,
  type LoginPayload,
  type RegisterMemberPayload,
  type RegisterNgoPayload,
  type RegisterIndividualPayload,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { setAccessToken } from "@/lib/api/client";

// SSR mirror cookie — short-lived, matches access token expiry (15 min)
const SSR_COOKIE_KEY = "la_lanh_token";
const SSR_COOKIE_MAX_AGE = 900; // seconds

function persistForSSR(token: string) {
  document.cookie = `${SSR_COOKIE_KEY}=${token}; path=/; SameSite=Lax; Max-Age=${SSR_COOKIE_MAX_AGE}`;
}

function clearSSRCookie() {
  document.cookie = `${SSR_COOKIE_KEY}=; path=/; Max-Age=0`;
}

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  registerMember: (payload: RegisterMemberPayload) => Promise<void>;
  registerNgo: (payload: RegisterNgoPayload) => Promise<void>;
  registerIndividual: (payload: RegisterIndividualPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Calls POST /auth/refresh-token (reads httpOnly cookie automatically).
   * On success: stores access token in memory + SSR mirror cookie.
   * On 401: clears state.
   */
  const refreshUser = useCallback(async () => {
    try {
      const res = await refreshTokenApi();
      setAccessToken(res.data.token);
      persistForSSR(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAccessToken(null);
        clearSSRCookie();
        setUser(null);
      }
    }
  }, []);

  // Restore session on mount by using the httpOnly refresh token cookie
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // Handle forced logout when account is locked (dispatched by apiClient 403 handler)
  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null);
      clearSSRCookie();
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    setAccessToken(res.data.token);
    persistForSSR(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // best-effort — clear client state regardless
    }
    setAccessToken(null);
    clearSSRCookie();
    setUser(null);
  }, []);

  const registerMember = useCallback(async (payload: RegisterMemberPayload) => {
    const res = await registerMemberApi(payload);
    setAccessToken(res.data.token);
    persistForSSR(res.data.token);
    setUser(res.data.user);
  }, []);

  const registerNgo = useCallback(async (payload: RegisterNgoPayload) => {
    const res = await registerNgoApi(payload);
    setAccessToken(res.data.token);
    persistForSSR(res.data.token);
    setUser(res.data.user);
  }, []);

  const registerIndividual = useCallback(
    async (payload: RegisterIndividualPayload) => {
      const res = await registerIndividualApi(payload);
      setAccessToken(res.data.token);
      persistForSSR(res.data.token);
      setUser(res.data.user);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        registerMember,
        registerNgo,
        registerIndividual,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
