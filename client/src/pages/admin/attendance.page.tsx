import * as React from "react";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { mockEmployees } from "@/data/mock";

// ─── Chart Mock Data by Scope ─────────────────────────────────

const weeklyAttendanceData = [
  { label: "Mon", present: 4, total: 5 },
  { label: "Tue", present: 5, total: 5 },
  { label: "Wed", present: 3, total: 5 },
  { label: "Thu", present: 4, total: 5 },
  { label: "Fri", present: 4, total: 5 },
];

const monthlyAttendanceData = [
  { label: "Week 1", present: 4, total: 5 },
  { label: "Week 2", present: 5, total: 5 },
  { label: "Week 3", present: 3, total: 5 },
  { label: "Week 4", present: 4, total: 5 },
];

const statusColors = {
  PRESENT: "bg-success/15 text-success border-0",
  ABSENT: "bg-destructive/15 text-destructive border-0",
  HALF_DAY: "bg-warning/15 text-warning border-0",
  LEAVE: "bg-info/15 text-info border-0",
} as const;

export function AttendanceRecordsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [scope, setScope] = React.useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const chartData = scope === "weekly" ? weeklyAttendanceData : monthlyAttendanceData;

  // Filtered list matching search query
  const filteredEmployees = mockEmployees.filter((emp) =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Shift selected date back/forward
  const adjustDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Attendance Records
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor daily presence metrics and historical logs.
        </p>
      </div>

      {/* ─── Graph / Time Axis Section ───────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Presence Rate Axis
            </h3>
            <p className="text-xs text-muted-foreground">
              Average employees marked present over time.
            </p>
          </div>
          
          {/* Scope Selector */}
          <div className="bg-accent/40 rounded-lg p-0.5 flex">
            <button
              onClick={() => setScope("weekly")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                scope === "weekly"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setScope("monthly")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                scope === "monthly"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Clean Cal.com Style SVG-Flex chart */}
        <div className="h-44 flex items-end justify-around gap-2.5 pt-4 border-b border-border/80 pb-1">
          {chartData.map((data, idx) => {
            const percentage = (data.present / data.total) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group max-w-[60px]">
                {/* Tooltip bar info */}
                <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {data.present}/{data.total}
                </span>
                
                {/* Visual Bar container */}
                <div className="w-full bg-accent/40 rounded-t-md overflow-hidden relative h-28 flex items-end">
                  <div
                    style={{ height: `${percentage}%` }}
                    className="w-full bg-primary rounded-t-sm transition-all duration-300"
                  />
                </div>
                
                {/* Label */}
                <span className="text-xs text-muted-foreground font-semibold">
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Date Picker & Directory ─────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Logs for {selectedDate}
          </h2>

          {/* Date Paginator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustDate(-1)}
              className="size-8 flex items-center justify-center rounded-md border border-border bg-card hover:bg-accent text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 size-4 text-muted-foreground/60" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 pl-8 pr-2.5 border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={() => adjustDate(1)}
              className="size-8 flex items-center justify-center rounded-md border border-border bg-card hover:bg-accent text-foreground transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Directory Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search employee logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 pr-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
          />
        </div>

        {/* Table list */}
        <div className="border border-border bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Check In</th>
                  <th className="px-5 py-3.5">Check Out</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEmployees.map((emp) => {
                  // Simulate some random present/absent logs based on date
                  const isWeekend = new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6;
                  let checkIn = emp.checkIn;
                  let checkOut = emp.checkOut;
                  let status = emp.attendanceStatus;

                  if (isWeekend) {
                    checkIn = null;
                    checkOut = null;
                    status = "ABSENT";
                  }

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-surface-soft/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={emp.fullName} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {emp.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {checkIn || "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {checkOut || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[status]}
                        >
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceRecordsPage;
