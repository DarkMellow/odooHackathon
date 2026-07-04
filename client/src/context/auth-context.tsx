import * as React from "react";
import type { AuthUser, Role } from "@/types";
import { mockEmployeeUser, mockHRUser } from "@/data/mock";

interface AuthContextValue {
  user: AuthUser;
  role: Role;
  toggleRole: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("EMPLOYEE");

  const user = role === "EMPLOYEE" ? mockEmployeeUser : mockHRUser;

  const toggleRole = React.useCallback(() => {
    setRole((prev) => (prev === "EMPLOYEE" ? "HR" : "EMPLOYEE"));
  }, []);

  const value = React.useMemo(
    () => ({ user, role, toggleRole }),
    [user, role, toggleRole],
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
