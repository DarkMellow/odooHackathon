import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser, Role } from "@/types";

interface AuthContextValue {
  user: AuthUser;
  role: Role;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  toggleRole: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading, error, logout, checkAuth, setRole } = useAuthStore();

  // Run session restoration on mount
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const toggleRole = React.useCallback(() => {
    if (role) {
      setRole(role === "EMPLOYEE" ? "HR" : "EMPLOYEE");
    }
  }, [role, setRole]);

  const value = React.useMemo(
    () => ({
      user: user as AuthUser,
      role: (role || "EMPLOYEE") as Role,
      isLoading,
      error,
      logout,
      toggleRole,
    }),
    [user, role, isLoading, error, logout, toggleRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
