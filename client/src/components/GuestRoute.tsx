import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Show a premium loading state while checking the user session from cookies
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-16 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="size-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/40 border-l-transparent animate-spin" />
          <div className="absolute font-bold text-lg text-primary">H</div>
        </div>
        <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
          Restoring secure session...
        </p>
      </div>
    );
  }

  // Redirect authenticated users back to their respective dashboards
  if (isAuthenticated && user) {
    if (user.role === "HR") {
      return <Navigate to="/admin/employees" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default GuestRoute;
