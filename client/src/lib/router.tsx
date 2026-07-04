import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/app-layout";
import EmployeeDashboardPage from "@/pages/employee/dashboard.page";
import EmployeesPage from "@/pages/admin/employees.page";
import AttendanceRecordsPage from "@/pages/admin/attendance.page";
import LeaveApprovalsPage from "@/pages/admin/leave.page";
import SignIn from "@/pages/auth/signIn";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgotPassword";
import HomePage from "@/pages/home.page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "dashboard",
        element: <EmployeeDashboardPage />,
      },
      {
        path: "admin/dashboard",
        element: <Navigate to="/admin/employees" replace />,
      },
      {
        path: "admin/employees",
        element: <EmployeesPage />,
      },
      {
        path: "admin/attendance",
        element: <AttendanceRecordsPage />,
      },
      {
        path: "admin/leave",
        element: <LeaveApprovalsPage />,
      },
      // Placeholder routes — pages to be built in upcoming phases
      {
        path: "profile",
        element: <PlaceholderPage title="Profile" />,
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
