import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  balance: number;
  role: string;
  discount?: number;
  totalSpent?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone?: string, captchaAnswer?: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ user?: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const user = data?.user || null;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      queryClient.setQueryData(["/api/auth/me"], { user: result.user });
      await refetch();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (username: string, email: string, password: string, phone?: string, captchaAnswer?: string) => {
    setIsAuthenticating(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", { username, email, password, phone, captchaAnswer });
      const result = await res.json();
      if (result.error) {
        throw new Error(Array.isArray(result.error) ? result.error[0].message : result.error);
      }
      queryClient.setQueryData(["/api/auth/me"], { user: result.user });
      await refetch();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
    } finally {
      queryClient.setQueryData(["/api/auth/me"], { user: null });
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isAuthenticating,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refetchUser: refetch,
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
