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
  getMeApi,
  loginApi,
  registerMemberApi,
  registerNgoApi,
  registerIndividualApi,
  type LoginPayload,
  type RegisterMemberPayload,
  type RegisterNgoPayload,
  type RegisterIndividualPayload,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const TOKEN_KEY = "la_lanh_token";

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  registerMember: (payload: RegisterMemberPayload) => Promise<void>;
  registerNgo: (payload: RegisterNgoPayload) => Promise<void>;
  registerIndividual: (payload: RegisterIndividualPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  // Mirror to cookie so Server Components can read it for SSR
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMeApi();
      setUser(res.data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        setUser(null);
      }
    }
  }, []);

  // Attempt to restore session on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // Handle forced logout when account is locked (dispatched by apiClient 403 handler)
  useEffect(() => {
    const handleForcedLogout = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const registerMember = useCallback(async (payload: RegisterMemberPayload) => {
    const res = await registerMemberApi(payload);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const registerNgo = useCallback(async (payload: RegisterNgoPayload) => {
    const res = await registerNgoApi(payload);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const registerIndividual = useCallback(
    async (payload: RegisterIndividualPayload) => {
      const res = await registerIndividualApi(payload);
      setToken(res.data.token);
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
