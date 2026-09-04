"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { User, LoginPayload, RegisterPayload } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<User>("/auth/login", payload);
    setUser(data);
    toast.success(`Welcome back, ${data.name}!`);
    router.push(`/${data.role}`);
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<User>("/auth/register", payload);
    setUser(data);
    toast.success("Account created successfully!");
    router.push(`/${data.role}`);
  };

  const loginWithGoogle = async (idToken: string) => {
    const { data } = await api.post<User>("/auth/google", { idToken });
    setUser(data);
    toast.success(`Welcome, ${data.name}!`);
    router.push(`/${data.role}`);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
