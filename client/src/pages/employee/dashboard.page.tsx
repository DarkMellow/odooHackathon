import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import {
  mockTodayAttendance,
  mockLeaveRequests,
  mockSalary,
  mockActivities,
} from "@/data/mock";
import {
  User,
  Clock,
  CalendarDays,
  Banknote,
  LogIn,
  LogOut as LogOutIcon,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Component ─────────────────────────────────────────────────

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const firstName = user.profile.fullName.split(" ")[0];
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate initial data load
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Attendance state
  const todayAttendance = mockTodayAttendance;
  const isCheckedIn = !!todayAttendance.checkIn;
  const [localCheckIn, setLocalCheckIn] = React.useState(
    todayAttendance.checkIn,
  );
  const [localCheckOut, setLocalCheckOut] = React.useState(
    todayAttendance.checkOut,
  );

  // Leave stats
  const pendingLeaves = mockLeaveRequests.filter(
    (l) => l.status === "PENDING",
  ).length;

  // Salary
  const salary = mockSalary;

  // Handle check-in / check-out (optimistic UI)
  function handleCheckIn() {
    setLocalCheckIn(new Date().toISOString());
  }

  function handleCheckOut() {
    setLocalCheckOut(new Date().toISOString());
  }

  const effectiveCheckedIn = !!localCheckIn;
  const effectiveCheckedOut = !!localCheckOut;

  // ─── Loading skeleton ──────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 md:pb-0">
        {/* Greeting skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Check-in banner skeleton */}
        <Skeleton className="h-20 w-full rounded-xl" />

        {/* Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>

        {/* Activity skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* ─── Greeting Header ──────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {getGreeting()},{" "}
          <span className="text-foreground">{firstName}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDate(new Date())}
        </p>
      </div>

      {/* ─── Check-In / Check-Out Banner ──────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
              <Clock className="size-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Today's Attendance
              </p>
              {effectiveCheckedIn ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="secondary"
                    className="bg-success/10 text-success border-0 text-xs font-medium"
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    Checked in
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    at {formatTime(localCheckIn)}
                  </span>
                  {effectiveCheckedOut && (
                    <>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(localCheckOut)}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  You haven't checked in yet today
                </p>
              )}
            </div>
          </div>

          <div>
            {!effectiveCheckedIn ? (
              <Button onClick={handleCheckIn} className="gap-2 w-full sm:w-auto">
                <LogIn className="size-4" />
                Check In
              </Button>
            ) : !effectiveCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <LogOutIcon className="size-4" />
                Check Out
              </Button>
            ) : (
              <Button disabled variant="secondary" className="gap-2 w-full sm:w-auto">
                <CheckCircle2 className="size-4" />
                Day complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Quick Stats Row ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Work Hours Today"
          value={
            effectiveCheckedIn
              ? effectiveCheckedOut
                ? (() => {
                    const diff =
                      new Date(localCheckOut!).getTime() -
                      new Date(localCheckIn!).getTime();
                    const hrs = Math.floor(diff / 3_600_000);
                    const mins = Math.floor((diff % 3_600_000) / 60_000);
                    return `${hrs}h ${mins}m`;
                  })()
                : "In progress"
              : "—"
          }
          description={effectiveCheckedIn ? "Since " + formatTime(localCheckIn) : "Not started"}
          icon={Clock}
          variant="success"
        />
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves}
          description={
            pendingLeaves === 0
              ? "No pending requests"
              : `${pendingLeaves} awaiting review`
          }
          icon={CalendarDays}
          variant={pendingLeaves > 0 ? "warning" : "default"}
        />
        <StatCard
          label="This Week"
          value="4/5"
          description="Days present"
          icon={TrendingUp}
          trend={{ value: "80% attendance", positive: true }}
        />
      </div>

      {/* ─── Quick Action Cards ───────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickActionCard
            title="My Profile"
            statusLine={user.profile.designation ?? "View your details"}
            icon={User}
            to="/profile"
          />
          <QuickActionCard
            title="Attendance History"
            statusLine={
              isCheckedIn
                ? `Checked in at ${formatTime(todayAttendance.checkIn)}`
                : "View your records"
            }
            icon={Clock}
            to="/attendance"
            variant="success"
          />
          <QuickActionCard
            title="Leave Requests"
            statusLine={
              pendingLeaves > 0
                ? `${pendingLeaves} pending request${pendingLeaves > 1 ? "s" : ""}`
                : "No pending requests"
            }
            icon={CalendarDays}
            to="/leave"
            variant={pendingLeaves > 0 ? "warning" : "default"}
          />
          <QuickActionCard
            title="Salary Structure"
            statusLine={`Base: $${salary.baseSalary.toLocaleString()}/mo`}
            icon={Banknote}
            to="/profile"
            variant="info"
          />
        </div>
      </div>

      <Separator />

      {/* ─── Recent Activity ──────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <ActivityTimeline items={mockActivities} />
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
