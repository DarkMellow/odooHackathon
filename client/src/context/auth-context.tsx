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
  const { user, role, isLoading, error, logout, checkAuth, setRole, bypassActive, toggleBypass } = useAuthStore();

  // Run session restoration on mount
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for the "s" or "S" key globally to toggle authentication bypass
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggleBypass();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleBypass]);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {bypassActive && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-amber-600 animate-pulse select-none">
          <span className="size-2 bg-white rounded-full animate-ping" />
          <span>Bypass Mode Active (Press 'S' to exit)</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
