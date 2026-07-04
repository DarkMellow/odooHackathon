import * as React from "react";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X as XIcon,
  AlertCircle,
  CalendarRange,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

// ── API types ──────────────────────────────────────────────────
interface PendingLeaveRequest {
  id: number;
  userId: number;
  leaveType: "PAID" | "SICK" | "UNPAID";
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  employeeRemarks: string | null;
  createdAt: string;
  // Employee info
  employeeId: string;
  fullName: string;
  department: string | null;
  designation: string | null;
  profilePictureUrl: string | null;
}

interface LeaderboardEntry {
  userId: number;
  employeeId: string;
  fullName: string;
  designation: string;
  approvedCount: number;
  daysCount: number;
}

interface LeaveStats {
  totalApprovedLeaves: number;
  totalApprovedDays: number;
  currentMonth: string;
}

// ── Component ──────────────────────────────────────────────────

export function LeaveApprovalsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [leaveRequests, setLeaveRequests] = React.useState<PendingLeaveRequest[]>([]);
  const [stats, setStats] = React.useState<LeaveStats | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [reviewComments, setReviewComments] = React.useState<Record<number, string>>({});
  const [commentErrors, setCommentErrors] = React.useState<Record<number, string>>({});
  const [processingId, setProcessingId] = React.useState<number | null>(null);
  const [alertSuccess, setAlertSuccess] = React.useState<string | null>(null);
  const [alertError, setAlertError] = React.useState<string | null>(null);

  // ── Fetch pending queue ──────────────────────────────────────
  const fetchData = React.useCallback(async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        fetch("/api/admin/leave/approvals", { credentials: "include" }),
        fetch("/api/admin/leave/stats", { credentials: "include" }),
      ]);

      const queueData = await queueRes.json();
      const statsData = await statsRes.json();

      if (queueData.success) {
        setLeaveRequests(queueData.leaveRequests);
      }
      if (statsData.success) {
        setStats(statsData.stats);
        setLeaderboard(statsData.leaderboard);
      }
    } catch (err: any) {
      setAlertError(err.message || "Failed to load leave data.");
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    async function load() {
      await fetchData();
      if (active) setIsLoading(false);
    }
    load();
    return () => { active = false; };
  }, [fetchData]);

  // ── Review action (approve or reject) ───────────────────────
  const handleReview = async (id: number, action: "APPROVED" | "REJECTED") => {
    const comment = reviewComments[id]?.trim() ?? "";

    if (action === "REJECTED" && !comment) {
      setCommentErrors((prev) => ({
        ...prev,
        [id]: "A rejection comment explaining the reason is required.",
      }));
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/leave/approvals/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          hrComments: comment || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Remove from pending queue and refresh stats
        setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
        setReviewComments((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setCommentErrors((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        // Refresh stats & leaderboard in background
        fetchData();

        const label = action === "APPROVED" ? "approved" : "rejected";
        setAlertSuccess(`Leave request ${label} successfully.`);
        setTimeout(() => setAlertSuccess(null), 4000);
      } else {
        const errMsg =
          data.details?.map((d: any) => d.message).join(". ") ||
          data.message ||
          "Failed to process request.";
        setAlertError(errMsg);
        setTimeout(() => setAlertError(null), 5000);
      }
    } catch (err: any) {
      setAlertError(err.message || "Network error. Please try again.");
      setTimeout(() => setAlertError(null), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Leave Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Process pending time-off requests and monitor team leave balances.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-2 bg-card hover:bg-accent"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      {/* ─── Global Alerts ───────────────────────────────── */}
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

      {/* ─── Split Top Section ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        {/* Left Column: Stats + Leaderboard */}
        <div className="space-y-4">
          {/* Approved this month card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Leaves Approved
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {stats?.totalApprovedLeaves ?? 0} Leaves
                </h2>
                <p className="text-sm text-muted-foreground">
                  Approved this month
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent/40 text-foreground">
                <CalendarRange className="size-5" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground/60 border-t border-border/40 pt-3 mt-4">
              Active tracker ({stats?.currentMonth ?? "Current Month"}) —{" "}
              {stats?.totalApprovedDays ?? 0} total days off
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Approved Leaves Leaderboard
              </h3>
              <p className="text-xs text-muted-foreground">
                Leaves approved in descending order of volume.
              </p>
            </div>

            <div className="border border-border bg-card rounded-xl overflow-hidden max-h-[380px] flex flex-col">
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">No approved leaves yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3">Employee</th>
                        <th className="px-5 py-3 text-center">Approved</th>
                        <th className="px-5 py-3 text-right">Days Off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {leaderboard.map((rank) => (
                        <tr key={rank.userId} className="hover:bg-surface-soft/40 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <InitialsAvatar name={rank.fullName} size="sm" className="size-8" />
                              <div>
                                <p className="font-semibold text-foreground leading-tight">
                                  {rank.fullName}
                                </p>
                                <p className="text-muted-foreground text-[10px] mt-0.5">
                                  ID: {rank.employeeId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center font-medium text-foreground">
                            {rank.approvedCount}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Badge
                              variant="secondary"
                              className={
                                rank.approvedCount > 0
                                  ? "bg-success/15 text-success border-0 font-semibold"
                                  : "bg-muted-foreground/15 text-muted-foreground border-0 font-medium"
                              }
                            >
                              {rank.daysCount} Days
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Statistics placeholder */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between min-h-[480px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
          <div className="flex justify-between items-start w-full">
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Leave Trend & Insights
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Monthly Statistics
              </h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/40 text-foreground">
              <CalendarRange className="size-5" />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-sm font-semibold text-foreground">
              Visual leave trends coming soon
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Monthly breakdown reports, department distributions, and peak leave periods will be
              rendered here.
            </p>
          </div>

          <div className="text-[11px] text-muted-foreground/60 border-t border-border/40 pt-3">
            Realtime Analytics
          </div>
        </div>
      </div>

      <Separator />

      {/* ─── Leave Queue Section ─────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Pending Approvals Queue ({leaveRequests.length})
        </h2>

        {leaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-surface-soft text-center">
            <span className="text-3xl mb-2">🎉</span>
            <p className="text-sm font-semibold text-foreground">Queue clear!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All leave requests have been processed successfully.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                {/* Employee header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      name={req.fullName}
                      imageUrl={req.profilePictureUrl}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{req.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID: {req.employeeId}
                        {req.department && ` • ${req.department}`}
                        {" • Leave Type: "}
                        <span className="font-semibold">{req.leaveType}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(req.startDate)} to {formatDate(req.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Duration: {req.totalDays} Day{req.totalDays > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Employee remarks */}
                {req.employeeRemarks && (
                  <div className="bg-surface-soft border border-border/60 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Employee Remarks
                    </p>
                    <p className="text-sm text-foreground mt-1">"{req.employeeRemarks}"</p>
                  </div>
                )}

                {/* Comment & action controls */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Add reviewer comments (required on rejection)..."
                      value={reviewComments[req.id] || ""}
                      disabled={processingId === req.id}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReviewComments((prev) => ({ ...prev, [req.id]: val }));
                        if (val.trim()) {
                          setCommentErrors((prev) => {
                            const next = { ...prev };
                            delete next[req.id];
                            return next;
                          });
                        }
                      }}
                      className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
                    />
                    {commentErrors[req.id] && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3" />
                        {commentErrors[req.id]}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleReview(req.id, "REJECTED")}
                      disabled={processingId === req.id}
                      className="border-destructive/30 hover:bg-destructive/10 text-destructive gap-1.5 h-9"
                    >
                      <XIcon className="size-4" />
                      {processingId === req.id ? "Processing…" : "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleReview(req.id, "APPROVED")}
                      disabled={processingId === req.id}
                      className="bg-primary hover:bg-primary/95 gap-1.5 h-9"
                    >
                      <Check className="size-4" />
                      {processingId === req.id ? "Processing…" : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveApprovalsPage;
