import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const location = useLocation();

  // Show a premium visual loading state while checking the user session from cookies
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute size-16 rounded-full border-4 border-primary/20 animate-ping" />
          {/* Spinning ring inner */}
          <div className="size-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/40 border-l-transparent animate-spin" />
          {/* Central Logo Letter */}
          <div className="absolute font-bold text-lg text-primary">H</div>
        </div>
        <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
          Restoring secure session...
        </p>
      </div>
    );
  }

  // Redirect to signin if user is not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if role is authorized to view this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If an employee attempts to access HR screens, redirect them to their dashboard
    if (user.role === "EMPLOYEE") {
      return <Navigate to="/dashboard" replace />;
    }
    // Otherwise redirect to HR landing
    return <Navigate to="/admin/employees" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
