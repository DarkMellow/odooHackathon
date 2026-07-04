import * as React from "react";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X as XIcon, AlertCircle, CalendarRange } from "lucide-react";
import {
  mockPendingLeaveRequests,
  mockEmployees,
} from "@/data/mock";
import type {
  MockPendingLeaveRequest,
  LeaveType,
} from "@/data/mock";

// Mock count of leaves approved for ranking
const mockLeaveApprovedRanking = [
  { fullName: "Emily Davis", employeeId: "EMP202604", designation: "Product Designer", approvedCount: 6, daysCount: 14 },
  { fullName: "Sarah Connor", employeeId: "EMP202606", designation: "Operations Lead", approvedCount: 4, daysCount: 8 },
  { fullName: "John Smith", employeeId: "EMP202603", designation: "Backend Tech Lead", approvedCount: 2, daysCount: 5 },
  { fullName: "Jane Doe", employeeId: "EMP202601", designation: "Senior Frontend Engineer", approvedCount: 1, daysCount: 1 },
  { fullName: "Michael Brown", employeeId: "EMP202605", designation: "Growth Specialist", approvedCount: 0, daysCount: 0 },
];

export function LeaveApprovalsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [leaveRequests, setLeaveRequests] = React.useState<MockPendingLeaveRequest[]>([]);
  const [rejectionComments, setRejectionComments] = React.useState<Record<number, string>>({});
  const [commentErrors, setCommentErrors] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLeaveRequests(mockPendingLeaveRequests);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveLeave = (id: number) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRejectLeave = (id: number) => {
    const comment = rejectionComments[id]?.trim();
    if (!comment) {
      setCommentErrors((prev) => ({
        ...prev,
        [id]: "Rejection explanation comment is required.",
      }));
      return;
    }
    setCommentErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Leave Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Process pending time-off requests and monitor team leave balances.
        </p>
      </div>

      {/* ─── Split Top Section (Orange Left Column, Green Right Column) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        
        {/* Left Column (Orange Outline Area) */}
        <div className="space-y-4">
          {/* Leaves approved this month card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Leaves Approved
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  13 Leaves
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
              Active logger tracker (July 2026)
            </div>
          </div>

          {/* Approved leave ranking leaderboard */}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3">Employee</th>
                      <th className="px-5 py-3 text-center">Approved Leaves</th>
                      <th className="px-5 py-3 text-right">Total Days Off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {mockLeaveApprovedRanking.map((rank, idx) => (
                      <tr key={idx} className="hover:bg-surface-soft/40 transition-colors">
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
            </div>
          </div>
        </div>

        {/* Right Column (Green Outline Area) */}
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
              Monthly breakdown reports, department distributions, and peak leave periods will be rendered here.
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
            <p className="text-sm font-semibold text-foreground">
              Queue clear!
            </p>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={req.fullName} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {req.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID: {req.employeeId} • Leave Type:{" "}
                        <span className="font-semibold">{req.leaveType}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {req.startDate} to {req.endDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Duration: {req.totalDays} Day{req.totalDays > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-soft border border-border/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Employee Remarks
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    "{req.employeeRemarks}"
                  </p>
                </div>

                {/* Comment & Rejection controls */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Add reviewer comments (required on rejection)..."
                      value={rejectionComments[req.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRejectionComments((prev) => ({
                          ...prev,
                          [req.id]: val,
                        }));
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
                      onClick={() => handleRejectLeave(req.id)}
                      className="border-destructive/30 hover:bg-destructive/10 text-destructive gap-1.5 h-9"
                    >
                      <XIcon className="size-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApproveLeave(req.id)}
                      className="bg-primary hover:bg-primary/95 gap-1.5 h-9"
                    >
                      <Check className="size-4" />
                      Approve
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
