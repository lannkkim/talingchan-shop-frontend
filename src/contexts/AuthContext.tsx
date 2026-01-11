"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, LoginInput, RegisterInput } from "@/types/auth";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  refreshToken as refreshTokenService,
} from "@/services/auth";
import { setAccessToken } from "@/lib/axios";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      // Check if this is a social login callback
      const loginSuccess = searchParams.get("login_success");

      try {
        // Try to verify session by refreshing token silently
        // Note: Backend doesn't have /me, so we rely on refresh returning a token.
        // But refreshing requires a cookie. If cookie exists, we get a token.
        // We also need to restore the User object.
        // Problem: /refresh-token currently only returns `{ token }`. It does NOT return the User object.
        // Solution 1: Update backend /refresh-token to return user too. -> Best.
        // Solution 2: Rely on localStorage for user info (display only), but trust token for auth. -> Acceptable for now.

        // Let's use stored user for display, and try refresh.

        const { token, user } = await refreshTokenService();
        setAccessToken(token); // Set in memory
        setUser(user);

        // Clean up URL if this was a social login callback
        if (loginSuccess === "true") {
          window.history.replaceState({}, "", pathname);
        }
      } catch (error) {
        // Refresh failed (no cookie or expired)
        // Clear everything
        setUser(null);

        setAccessToken(null);

        // Still clean up URL if login_success was present
        if (loginSuccess === "true") {
          window.history.replaceState({}, "", pathname);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [searchParams, pathname]);

  const login = async (input: LoginInput) => {
    try {
      const { user: userData, token } = await loginService(input);
      setUser(userData);

      setAccessToken(token); // Set in memory
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      const { user: userData, token } = await registerService(input);
      setUser(userData);

      setAccessToken(token);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
