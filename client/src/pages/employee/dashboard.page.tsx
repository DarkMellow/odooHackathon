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
  mockSalary,
} from "@/data/mock";
import type { LeaveRequest } from "@/types";
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

  // Real attendance state
  const [attendanceLogs, setAttendanceLogs] = React.useState<any[]>([]);
  const [localCheckIn, setLocalCheckIn] = React.useState<string | null>(null);
  const [localCheckOut, setLocalCheckOut] = React.useState<string | null>(null);
  const [isSubmittingCheck, setIsSubmittingCheck] = React.useState(false);
  const [attendanceError, setAttendanceError] = React.useState<string | null>(null);

  // Real leave state
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);

  // Fetch attendance
  const fetchAttendanceData = React.useCallback(async () => {
    try {
      const response = await fetch("/api/employee/attendance/history", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceLogs(data.logs || []);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayLog = (data.logs || []).find((log: any) =>
          new Date(log.date).toISOString().slice(0, 10) === todayStr
        );
        if (todayLog) {
          setLocalCheckIn(todayLog.checkIn || null);
          setLocalCheckOut(todayLog.checkOut || null);
        } else {
          setLocalCheckIn(null);
          setLocalCheckOut(null);
        }
      } else {
        setAttendanceError(data.message || "Failed to load attendance logs");
      }
    } catch (err: any) {
      setAttendanceError(err.message || "An error occurred fetching attendance");
    }
  }, []);

  // Fetch leave requests
  const fetchLeaveData = React.useCallback(async () => {
    try {
      const response = await fetch("/api/employee/leave", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setLeaveRequests(data.leaves || []);
      }
    } catch (err: any) {
      // Non-critical — dashboard still works without leave data
      console.warn("Failed to load leave requests:", err.message);
    }
  }, []);

  // Initial data load
  React.useEffect(() => {
    let active = true;
    async function loadData() {
      await Promise.all([fetchAttendanceData(), fetchLeaveData()]);
      if (active) {
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [fetchAttendanceData, fetchLeaveData]);

  // Live leave stats from API
  const pendingLeaves = leaveRequests.filter((l) => l.status === "PENDING").length;

  // Salary
  const salary = mockSalary;

  // Handle check-in / check-out
  async function handleCheckIn() {
    setIsSubmittingCheck(true);
    setAttendanceError(null);
    try {
      const response = await fetch("/api/employee/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        await fetchAttendanceData();
      } else {
        setAttendanceError(data.message || "Check-in failed");
      }
    } catch (err: any) {
      setAttendanceError(err.message || "An error occurred during check-in");
    } finally {
      setIsSubmittingCheck(false);
    }
  }

  async function handleCheckOut() {
    setIsSubmittingCheck(true);
    setAttendanceError(null);
    try {
      const response = await fetch("/api/employee/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        await fetchAttendanceData();
      } else {
        setAttendanceError(data.message || "Check-out failed");
      }
    } catch (err: any) {
      setAttendanceError(err.message || "An error occurred during check-out");
    } finally {
      setIsSubmittingCheck(false);
    }
  }

  const effectiveCheckedIn = !!localCheckIn;
  const effectiveCheckedOut = !!localCheckOut;

  // Dynamic Recent Activity Timeline
  const recentActivities = React.useMemo(() => {
    const list: any[] = [];
    
    // Process real attendance logs
    attendanceLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const dateLabel = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (log.checkIn) {
        list.push({
          id: `checkin-${log.id}`,
          type: "attendance",
          message: `You checked in on ${dateLabel} at ${formatTime(log.checkIn)}`,
          timestamp: log.checkIn,
          status: "success",
        });
      }
      if (log.checkOut) {
        list.push({
          id: `checkout-${log.id}`,
          type: "attendance",
          message: `You checked out on ${dateLabel} at ${formatTime(log.checkOut)}`,
          timestamp: log.checkOut,
          status: "success",
        });
      }
      if (log.status === "LEAVE") {
        list.push({
          id: `leave-${log.id}`,
          type: "attendance",
          message: `You were on leave on ${dateLabel}`,
          timestamp: log.date,
          status: "info",
        });
      }
      if (log.status === "ABSENT" && !log.checkIn) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const logStr = new Date(log.date).toISOString().slice(0, 10);
        if (logStr !== todayStr) {
          list.push({
            id: `absent-${log.id}`,
            type: "attendance",
            message: `You were absent on ${dateLabel}`,
            timestamp: log.date,
            status: "warning",
          });
        }
      }
    });

    // Merge in real leave request activities
    leaveRequests.forEach((leave) => {
      const leaveLabel = leave.leaveType === "PAID"
        ? "Paid Leave"
        : leave.leaveType === "SICK"
        ? "Sick Leave"
        : "Unpaid Leave";
      const startFmt = new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endFmt = new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (leave.status === "APPROVED") {
        list.push({
          id: `leave-approved-${leave.id}`,
          type: "leave",
          message: `Your ${leaveLabel} (${startFmt}${startFmt !== endFmt ? ` – ${endFmt}` : ""}) was approved`,
          timestamp: leave.decisionDate || leave.createdAt,
          status: "success",
        });
      } else if (leave.status === "REJECTED") {
        list.push({
          id: `leave-rejected-${leave.id}`,
          type: "leave",
          message: `Your ${leaveLabel} (${startFmt}${startFmt !== endFmt ? ` – ${endFmt}` : ""}) was rejected`,
          timestamp: leave.decisionDate || leave.createdAt,
          status: "warning",
        });
      } else if (leave.status === "PENDING") {
        list.push({
          id: `leave-pending-${leave.id}`,
          type: "leave",
          message: `You applied for ${leaveLabel} (${startFmt}${startFmt !== endFmt ? ` – ${endFmt}` : ""})`,
          timestamp: leave.createdAt,
          status: "info",
        });
      }
    });

    // Sort by timestamp descending
    const sorted = list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.slice(0, 5);
  }, [attendanceLogs, leaveRequests]);

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

      {/* ─── Attendance Error Alert ────────────────────────── */}
      {attendanceError && (
        <div className="bg-destructive/15 border border-destructive/25 rounded-xl p-4 text-sm text-destructive flex items-center justify-between">
          <span>{attendanceError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttendanceError(null)}
            className="text-destructive hover:bg-destructive/10 h-7 px-2"
          >
            Dismiss
          </Button>
        </div>
      )}

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
              <Button onClick={handleCheckIn} disabled={isSubmittingCheck} className="gap-2 w-full sm:w-auto">
                <LogIn className="size-4" />
                Check In
              </Button>
            ) : !effectiveCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                disabled={isSubmittingCheck}
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
          value={(() => {
            const presentDays = attendanceLogs.filter(
              (log) => log.status === "PRESENT" || log.status === "HALF_DAY"
            ).length;
            return `${presentDays}/5`;
          })()}
          description="Days present"
          icon={TrendingUp}
          trend={(() => {
            const presentDays = attendanceLogs.filter(
              (log) => log.status === "PRESENT" || log.status === "HALF_DAY"
            ).length;
            const rate = Math.round((presentDays / 5) * 100);
            return { value: `${rate}% attendance`, positive: rate >= 80 };
          })()}
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
              effectiveCheckedIn
                ? `Checked in at ${formatTime(localCheckIn)}`
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
          <ActivityTimeline items={recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
