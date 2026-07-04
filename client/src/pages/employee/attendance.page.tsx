import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { mockAttendanceHistory } from "@/data/mock";
import type { Attendance, AttendanceStatus } from "@/types";

// Helper to format ISO dates to YYYY-MM-DD in local time
function getLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [weekOffset, setWeekOffset] = React.useState(0); // 0 = current week, -1 = prev week, etc.
  const [attendanceLogs, setAttendanceLogs] = React.useState<Attendance[]>([]);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Monday & Sunday calculations for the current weekOffset
  const { monday, sunday } = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentDay = now.getDay();
    // Monday is 1, Sunday is 0. If Sunday, offset is -6. Otherwise 1 - currentDay.
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const mon = new Date(now);
    mon.setDate(now.getDate() + distanceToMonday + weekOffset * 7);

    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { monday: mon, sunday: sun };
  }, [weekOffset]);

  // Fetch logs on weekOffset change
  React.useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setFetchError(null);

    const startDate = getLocalDateString(monday);
    const endDate = getLocalDateString(sunday);

    const loadHistory = async () => {
      try {
        const response = await fetch(
          `/api/employee/attendance/history?startDate=${startDate}&endDate=${endDate}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load attendance logs");
        }

        const data = await response.json();
        
        // Merge with mock history if backend is empty (for demo visualization)
        let mergedLogs = data.logs || [];
        if (mergedLogs.length === 0) {
          const startMs = monday.getTime();
          const endMs = sunday.getTime() + 86400000; // include full Sunday

          mergedLogs = mockAttendanceHistory.filter((log) => {
            const logTime = new Date(log.date).getTime();
            return logTime >= startMs && logTime <= endMs;
          });
        }

        setAttendanceLogs(mergedLogs);
      } catch (err: any) {
        console.error(err);
        setFetchError("Could not retrieve attendance logs. Showing local mock fallback.");
        
        // Fallback directly to mock on failure
        const startMs = monday.getTime();
        const endMs = sunday.getTime() + 86400000;
        const fallback = mockAttendanceHistory.filter((log) => {
          const logTime = new Date(log.date).getTime();
          return logTime >= startMs && logTime <= endMs;
        });
        setAttendanceLogs(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user, monday, sunday]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Please log in to view attendance.</p>
      </div>
    );
  }

  // Create absolute date logs for each of the 7 days of the selected week (Mon -> Sun)
  const dailyLogs = React.useMemo(() => {
    const days: { date: Date; dateStr: string; log: Attendance | null }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = getLocalDateString(d);
      const matchingLog = attendanceLogs.find(
        (log) => getLocalDateString(new Date(log.date)) === dStr
      ) || null;

      days.push({
        date: d,
        dateStr: dStr,
        log: matchingLog,
      });
    }
    return days;
  }, [monday, attendanceLogs]);

  // Calculations for stats
  const stats = React.useMemo(() => {
    let presentCount = 0;
    let totalMs = 0;
    const checkInTimes: number[] = []; // minutes since midnight

    attendanceLogs.forEach((log) => {
      if (log.status === "PRESENT" || log.status === "HALF_DAY") {
        presentCount++;
      }

      if (log.checkIn) {
        const checkInDate = new Date(log.checkIn);
        checkInTimes.push(checkInDate.getHours() * 60 + checkInDate.getMinutes());

        if (log.checkOut) {
          const checkOutDate = new Date(log.checkOut);
          totalMs += checkOutDate.getTime() - checkInDate.getTime();
        }
      }
    });

    const totalHours = Math.floor(totalMs / 3600000);
    const totalMins = Math.floor((totalMs % 3600000) / 60000);

    // Compute average check-in time
    let averageCheckInStr = "—";
    if (checkInTimes.length > 0) {
      const avgMins = Math.round(checkInTimes.reduce((sum, val) => sum + val, 0) / checkInTimes.length);
      const hours = Math.floor(avgMins / 60);
      const mins = avgMins % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMins = String(mins).padStart(2, "0");
      averageCheckInStr = `${displayHours}:${displayMins} ${ampm}`;
    }

    return {
      presentCount,
      totalHoursStr: totalMs > 0 ? `${totalHours}h ${totalMins}m` : "0h",
      averageCheckInStr,
    };
  }, [attendanceLogs]);

  // Formatter functions
  const formatDateRange = () => {
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    return `${monday.toLocaleDateString("en-US", opts)} — ${sunday.toLocaleDateString("en-US", opts)}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getDayLabel = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return "—";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const statusColors = {
    PRESENT: "bg-success/15 text-success border-0",
    HALF_DAY: "bg-warning/15 text-warning border-0",
    ABSENT: "bg-destructive/15 text-destructive border-0",
    LEAVE: "bg-info/15 text-info border-0",
  } as const;

  const todayStr = getLocalDateString(new Date());

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Attendance History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your daily presence logs, hours logged, and weekly schedules.
          </p>
        </div>

        {/* Date Paginator */}
        <div className="flex items-center gap-1.5 bg-accent/30 rounded-lg p-0.5 self-start sm:self-auto border border-border">
          <Button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-md shrink-0 hover:bg-background transition-colors"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs font-semibold text-foreground px-3 select-none">
            {formatDateRange()}
          </span>
          <Button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-md shrink-0 hover:bg-background transition-colors"
            disabled={weekOffset >= 0}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* ─── Warning message on fetch error ──────────────── */}
      {fetchError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-xs font-semibold text-warning animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ─── Metrics Rows ────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Days Present (This Week)"
            value={`${stats.presentCount} / 5 Days`}
            description="Excludes weekends"
            icon={Calendar}
          />
          <StatCard
            label="Hours Logged"
            value={stats.totalHoursStr}
            description="Accumulated work time"
            icon={Clock}
            variant="success"
          />
          <StatCard
            label="Avg. Check-In Time"
            value={stats.averageCheckInStr}
            description="Weekly punctuality check"
            icon={TrendingUp}
            variant={stats.averageCheckInStr !== "—" ? "info" : "default"}
          />
        </div>
      )}

      {/* ─── Weekly Attendance Log Sheets ────────────────── */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-surface-soft/40">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Presence Log Sheet
          </h2>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[600px]">
              <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Day / Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Check In</th>
                  <th className="px-5 py-3">Check Out</th>
                  <th className="px-5 py-3 text-right">Work Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dailyLogs.map(({ date, dateStr, log }) => {
                  const isToday = dateStr === todayStr;
                  const isFuture = date > new Date();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  // Resolve final parameters for rendering
                  let status: AttendanceStatus | "WEEKEND" | "UPCOMING" | "ABSENT" = "ABSENT";
                  let checkIn = "—";
                  let checkOut = "—";
                  let workHrs = "—";

                  if (log) {
                    status = log.status;
                    checkIn = formatTime(log.checkIn);
                    checkOut = formatTime(log.checkOut);
                    workHrs = getDuration(log.checkIn, log.checkOut);
                    if (log.checkIn && !log.checkOut && isToday) {
                      workHrs = "In progress";
                    }
                  } else if (isFuture) {
                    status = "UPCOMING";
                  } else if (isWeekend) {
                    status = "WEEKEND";
                  }

                  return (
                    <tr
                      key={dateStr}
                      className={cn(
                        "hover:bg-surface-soft/20 transition-colors",
                        isToday && "bg-primary/5 font-medium"
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {getDayName(date)}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {getDayLabel(date)}
                            {isToday && " (Today)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {status === "UPCOMING" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0.5 border-dashed border-border text-muted-foreground uppercase"
                          >
                            Upcoming
                          </Badge>
                        ) : status === "WEEKEND" ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0.5 bg-accent/60 text-muted-foreground border-0 uppercase"
                          >
                            Weekend
                          </Badge>
                        ) : (
                          <Badge
                            className={cn(
                              "text-[10px] py-0.5 font-medium uppercase",
                              statusColors[status as AttendanceStatus]
                            )}
                          >
                            {status === "HALF_DAY" ? "Half Day" : status.toLowerCase()}
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">{checkIn}</td>
                      <td className="px-5 py-4 font-mono text-xs">{checkOut}</td>
                      <td className="px-5 py-4 text-right font-semibold font-mono text-xs">
                        {workHrs}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeAttendancePage;
