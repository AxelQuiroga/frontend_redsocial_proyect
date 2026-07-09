import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { tokenStorage } from "@/infrastructure/tokenStorage";
import { userService } from "@/services/userService";
import type { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
    } catch (err) {
      console.error("Error al obtener usuario:", err);
      tokenStorage.remove();
      setUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      fetchUser();
    } else {
      setIsAuthChecking(false);
    }
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.login(email, password);
        tokenStorage.set(response.token);
        await fetchUser();
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          setError(
            axiosError.response?.data?.message || "Error al iniciar sesión"
          );
        } else {
          setError("Error al iniciar sesión");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isAuthChecking,
    login,
    logout,
    refreshUser,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
