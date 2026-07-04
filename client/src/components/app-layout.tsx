import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/components/theme-provider";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Clock,
  CalendarDays,
  User,
  Users,
  ClipboardList,
  Banknote,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import * as React from "react";

// ─── Navigation items by role ──────────────────────────────────

const employeeNav = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "Attendance", icon: Clock, to: "/attendance" },
  { label: "Leave", icon: CalendarDays, to: "/leave" },
  { label: "Profile", icon: User, to: "/profile" },
] as const;

const adminNav = [
  { label: "Employees", icon: Users, to: "/admin/employees" },
  { label: "Attendance Records", icon: Clock, to: "/admin/attendance" },
  { label: "Leave Approvals", icon: ClipboardList, to: "/admin/leave" },
  { label: "Salary Management", icon: Banknote, to: "/admin/payroll" },
] as const;

// ─── Main layout ───────────────────────────────────────────────

export function AppLayout() {
  const { user, role, toggleRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = role === "EMPLOYEE" ? employeeNav : adminNav;
  const firstName = user.profile.fullName.split(" ")[0];

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleToggleRole = React.useCallback(() => {
    toggleRole();
    if (role === "EMPLOYEE") {
      navigate("/admin/employees");
    } else {
      navigate("/dashboard");
    }
  }, [role, toggleRole, navigate]);

  function isActive(to: string) {
    return location.pathname === to;
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {/* ════════ Desktop Sidebar (>1024px) ════════ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex w-[260px] flex-col border-r border-border bg-surface-soft">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            H
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">
            HRMS
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + dev toggle + theme toggle */}
        <div className="border-t border-border p-4 space-y-4">
          {/* Theme switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
              Change Theme
            </span>
            <div className="flex bg-accent/30 rounded-lg p-0.5 w-full">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                  theme === "light"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="size-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                  theme === "dark"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="size-3.5" />
                Dark
              </button>
            </div>
          </div>

          {/* Dev role toggle */}
          <button
            onClick={handleToggleRole}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground bg-accent/50 hover:bg-accent transition-colors"
          >
            <ArrowLeftRight className="size-3.5" />
            <span>
              Switch to {role === "EMPLOYEE" ? "HR" : "Employee"} view
            </span>
          </button>

          {/* User card */}
          <div className="flex items-center gap-3">
            <InitialsAvatar
              name={user.profile.fullName}
              imageUrl={user.profile.profilePictureUrl}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.profile.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.profile.designation}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Log out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* ════════ Tablet Sidebar (768–1024px) ════════ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden md:flex lg:hidden w-[68px] flex-col items-center border-r border-border bg-surface-soft">
        {/* Brand */}
        <div className="flex h-16 items-center justify-center border-b border-border w-full">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            H
          </div>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 w-full">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center justify-center rounded-lg size-11 transition-colors mx-auto",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: user + toggle */}
        <div className="border-t border-border py-3 px-2 space-y-2 w-full flex flex-col items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleRole}
                className="flex items-center justify-center rounded-lg size-11 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ArrowLeftRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Switch to {role === "EMPLOYEE" ? "HR" : "Employee"} view
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/profile"
                className="flex items-center justify-center"
              >
                <InitialsAvatar
                  name={user.profile.fullName}
                  imageUrl={user.profile.profilePictureUrl}
                  size="md"
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user.profile.fullName}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* ════════ Mobile Top Bar + Drawer (<768px) ════════ */}
      <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
            H
          </div>
          <span className="font-semibold text-sm tracking-tight">HRMS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRole}
            className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 z-50 md:hidden bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="py-2 px-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar
                  name={user.profile.fullName}
                  imageUrl={user.profile.profilePictureUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {role === "EMPLOYEE" ? "Employee" : "HR Admin"}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════ Main Content ════════ */}
      <main
        className={cn(
          "min-h-screen transition-[margin]",
          /* Desktop */ "lg:ml-[260px]",
          /* Tablet */ "md:ml-[68px]",
          /* Mobile top bar offset */ "pt-14 md:pt-0",
        )}
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* ════════ Mobile Bottom Nav (<768px) ════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden h-16 items-stretch border-t border-border bg-background/95 backdrop-blur-md">
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className={cn("size-5", active && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AppLayout;
