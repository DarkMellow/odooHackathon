import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarRange,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { mockLeaveRequests } from "@/data/mock";
import type { LeaveRequest, LeaveType } from "@/types";

export function EmployeeLeavePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [requests, setRequests] = React.useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Success / Error alerts
  const [alertSuccess, setAlertSuccess] = React.useState<string | null>(null);
  const [alertError, setAlertError] = React.useState<string | null>(null);

  // Form states
  const [leaveType, setLeaveType] = React.useState<LeaveType>("PAID");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Initial load
  React.useEffect(() => {
    if (!user) return;

    const localKey = `leave_requests_${user.id}`;
    const cached = localStorage.getItem(localKey);
    let cachedRequests: LeaveRequest[] = [];

    if (cached) {
      try {
        cachedRequests = JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached leave requests", e);
      }
    }

    // Get all initial mock requests for this user
    const initialUserRequests = mockLeaveRequests.filter((r) => r.userId === user.id);
    
    // Merge: Keep any requests from cachedRequests that are custom (i.e. not in mockLeaveRequests)
    // plus all initialUserRequests
    const mockIds = new Set(initialUserRequests.map((r) => r.id));
    const customRequests = cachedRequests.filter((r) => !mockIds.has(r.id));
    
    const finalRequests = [...customRequests, ...initialUserRequests].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    setRequests(finalRequests);
    localStorage.setItem(localKey, JSON.stringify(finalRequests));

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Please log in to view your leave requests.</p>
      </div>
    );
  }

  // Calculate leave quotas (Paid quota = 15 days, Sick quota = 5 days)
  const PAID_QUOTA = 15;
  const SICK_QUOTA = 5;

  const paidDaysUsed = requests
    .filter((r) => r.leaveType === "PAID" && r.status === "APPROVED")
    .reduce((sum, r) => sum + r.totalDays, 0);

  const sickDaysUsed = requests
    .filter((r) => r.leaveType === "SICK" && r.status === "APPROVED")
    .reduce((sum, r) => sum + r.totalDays, 0);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const paidAvailable = Math.max(0, PAID_QUOTA - paidDaysUsed);
  const sickAvailable = Math.max(0, SICK_QUOTA - sickDaysUsed);

  // Calculate form duration
  const calculatedDuration = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError("Start date and End date are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    if (start < todayZero) {
      setFormError("Start date cannot be in the past.");
      return;
    }

    if (end < start) {
      setFormError("End date must be on or after the start date.");
      return;
    }

    const trimmedRemarks = remarks.trim();
    if (!trimmedRemarks) {
      setFormError("Please provide remarks explaining your request.");
      return;
    }

    if (trimmedRemarks.length < 10) {
      setFormError("Remarks must be at least 10 characters long.");
      return;
    }

    const duration = calculatedDuration;

    // Check if leave balance is exceeded
    if (leaveType === "PAID" && duration > paidAvailable) {
      setFormError(`Exceeds available Paid Leave quota. You only have ${paidAvailable} days left.`);
      return;
    }

    if (leaveType === "SICK" && duration > sickAvailable) {
      setFormError(`Exceeds available Sick Leave quota. You only have ${sickAvailable} days left.`);
      return;
    }

    // Check for date overlaps in existing requests (excluding WITHDRAWN/REJECTED ones)
    const overlaps = requests.some((r) => {
      if (r.status === "WITHDRAWN" || r.status === "REJECTED") return false;
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      return start <= rEnd && end >= rStart;
    });

    if (overlaps) {
      setFormError("This request overlaps with an existing leave application.");
      return;
    }

    const newRequest: LeaveRequest = {
      id: Date.now(),
      userId: user.id,
      leaveType,
      startDate,
      endDate,
      totalDays: duration,
      status: "PENDING",
      employeeRemarks: trimmedRemarks,
      reviewedBy: null,
      hrComments: null,
      decisionDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);

    const localKey = `leave_requests_${user.id}`;
    localStorage.setItem(localKey, JSON.stringify(updatedRequests));

    // Reset Form & Close Modal
    setStartDate("");
    setEndDate("");
    setRemarks("");
    setIsModalOpen(false);

    setAlertSuccess("Leave request submitted successfully!");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const handleWithdraw = (id: number) => {
    const updatedRequests = requests.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: "WITHDRAWN" as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    setRequests(updatedRequests);
    const localKey = `leave_requests_${user.id}`;
    localStorage.setItem(localKey, JSON.stringify(updatedRequests));

    setAlertSuccess("Leave request withdrawn.");
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const statusBadges = {
    APPROVED: "bg-success/15 text-success border-0 hover:bg-success/20",
    PENDING: "bg-warning/15 text-warning border-0 hover:bg-warning/20",
    REJECTED: "bg-destructive/15 text-destructive border-0 hover:bg-destructive/20",
    WITHDRAWN: "bg-muted/40 text-muted-foreground border-0 hover:bg-muted/50",
  } as const;

  const formatDateString = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Apply for time-off, monitor quotas, and check approval states.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 gap-1.5 h-9 font-semibold"
        >
          <Plus className="size-4" />
          New Application
        </Button>
      </div>

      {/* ─── Alerts ──────────────────────────────────────── */}
      {alertSuccess && (
        <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success/10 p-3.5 text-xs font-semibold text-success animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {alertError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{alertError}</span>
        </div>
      )}

      {/* ─── Quotas / Metrics Cards ─────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Paid Leave Balance"
          value={`${paidAvailable} / ${PAID_QUOTA} Days`}
          description="Available for use"
          icon={CalendarRange}
        />
        <StatCard
          label="Sick Leave Balance"
          value={`${sickAvailable} / ${SICK_QUOTA} Days`}
          description="Available for use"
          icon={Clock}
          variant="info"
        />
        <StatCard
          label="Pending Approvals"
          value={`${pendingCount} Request${pendingCount !== 1 ? "s" : ""}`}
          description="Under review by HR"
          icon={ClipboardList}
          variant={pendingCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* ─── Leaves List ─────────────────────────────────── */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-surface-soft/40">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Application History
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No leave applications</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              You haven't submitted any leave applications yet. Click "New Application" to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {requests.map((req) => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-surface-soft/20 transition-colors">
                <div className="space-y-2.5 max-w-2xl">
                  {/* Title block */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {req.leaveType === "PAID"
                        ? "Paid Leave"
                        : req.leaveType === "SICK"
                        ? "Sick Leave"
                        : "Unpaid Leave"}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatDateString(req.startDate)} — {formatDateString(req.endDate)}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <Badge variant="outline" className="text-[10px] font-medium py-0.5 border-border">
                      {req.totalDays} {req.totalDays === 1 ? "Day" : "Days"}
                    </Badge>
                  </div>

                  {/* Remarks */}
                  {req.employeeRemarks && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/80 block mb-0.5">My Reason:</span>
                      {req.employeeRemarks}
                    </p>
                  )}

                  {/* HR comments */}
                  {req.hrComments && (
                    <div className="rounded-lg bg-surface-soft/80 border border-border/40 p-3 mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/80 block mb-0.5">HR Comments:</span>
                      {req.hrComments}
                      <span className="block mt-1 text-[10px] text-muted-foreground/60 font-medium">
                        Reviewed by Alex Rivera on {req.decisionDate ? formatDateString(req.decisionDate) : "Recent Date"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Block & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                  <Badge className={cn("text-xs font-medium py-0.5 px-2.5 capitalize", statusBadges[req.status])}>
                    {req.status.toLowerCase()}
                  </Badge>

                  {req.status === "PENDING" && (
                    <Button
                      onClick={() => handleWithdraw(req.id)}
                      variant="outline"
                      className="h-7 text-[11px] font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] transition-all px-2.5 border-destructive/20"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Leave Form Modal ────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Dialog Card */}
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                New Leave Application
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 mb-4 text-xs font-semibold text-destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="h-10 px-3 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full font-medium"
                >
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 px-3 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 px-3 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full font-medium"
                  />
                </div>
              </div>

              {calculatedDuration > 0 && (
                <div className="rounded-lg bg-surface-soft/60 border border-border/40 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Duration calculated:</span>
                  <span className="font-bold text-foreground">
                    {calculatedDuration} {calculatedDuration === 1 ? "day" : "days"}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">Reason / Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-sm text-foreground p-3 border border-border rounded-md bg-background focus:ring-1 focus:ring-foreground focus:outline-none min-h-[90px] resize-none"
                  placeholder="Explain the reason for your time-off request..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="h-10 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 font-semibold h-10 px-5"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeLeavePage;
