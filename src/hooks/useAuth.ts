// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { User } from "../types/auth";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Verificar si hay token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setIsAuthChecking(false); 
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.login(email, password);
      localStorage.setItem("token", response.token);
      await fetchUser();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Error al iniciar sesión");
      } else {
        setError("Error al iniciar sesión");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isAuthChecking,
    login,
    logout,
    loading,
    error,
  };
}