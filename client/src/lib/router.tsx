import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/app-layout";
import EmployeeDashboardPage from "@/pages/employee/dashboard.page";
import EmployeesPage from "@/pages/admin/employees.page";
import AttendanceRecordsPage from "@/pages/admin/attendance.page";
import LeaveApprovalsPage from "@/pages/admin/leave.page";
import EmployeeProfilePage from "@/pages/employee/profile.page";
import SignIn from "@/pages/auth/signIn";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgotPassword";
import HomePage from "@/pages/home.page";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import VerifyEmailPage from "@/pages/auth/verifyEmail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signin",
    element: (
      <GuestRoute>
        <SignIn />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: <Navigate to="/signin" replace />,
  },
  {
    path: "/signup",
    element: (
      <GuestRoute>
        <Signup />
      </GuestRoute>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <EmployeeDashboardPage />,
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["HR"]}>
            <Navigate to="/admin/employees" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/employees",
        element: (
          <ProtectedRoute allowedRoles={["HR"]}>
            <EmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/attendance",
        element: (
          <ProtectedRoute allowedRoles={["HR"]}>
            <AttendanceRecordsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/leave",
        element: (
          <ProtectedRoute allowedRoles={["HR"]}>
            <LeaveApprovalsPage />
          </ProtectedRoute>
        ),
      },
      // Placeholder routes — pages to be built in upcoming phases
      {
        path: "profile",
        element: <EmployeeProfilePage />,
      },
      {
        path: "attendance",
        element: <PlaceholderPage title="Attendance" />,
      },
      {
        path: "leave",
        element: <PlaceholderPage title="Leave Requests" />,
      },
      {
        path: "admin/payroll",
        element: <PlaceholderPage title="Payroll" />,
      },
      {
        path: "signin",
        element: <SignIn />
      },
      {
        path: "signup",
        element: <Signup />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      }
    ],
  },
]);

// Temporary placeholder for routes that aren't built yet
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-card p-16 min-h-[50vh]">
      <div className="text-center space-y-2">
        <p className="text-3xl">🚧</p>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          This section is under construction
        </p>
      </div>
    </div>
  );
}
