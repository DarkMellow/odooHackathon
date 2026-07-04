import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  ClipboardList,
  Search,
  Check,
  X as XIcon,
  AlertCircle,
} from "lucide-react";
import {
  mockPendingLeaveRequests,
} from "@/data/mock";
import type {
  MockPendingLeaveRequest,
} from "@/data/mock";

// ─── Status Badge Colors ────────────────────────────────────────

const statusColors = {
  PRESENT: "bg-success/15 text-success border-0",
  ABSENT: "bg-destructive/15 text-destructive border-0",
  HALF_DAY: "bg-warning/15 text-warning border-0",
  LEAVE: "bg-info/15 text-info border-0",
} as const;

export function AdminDashboardPage() {
  const { user } = useAuth();
  const firstName = user.profile.fullName.split(" ")[0];
  const [isLoading, setIsLoading] = React.useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState("All");

  // Dynamic Data Lists
  const [leaveRequests, setLeaveRequests] = React.useState<MockPendingLeaveRequest[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [rejectionComments, setRejectionComments] = React.useState<Record<number, string>>({});
  const [commentErrors, setCommentErrors] = React.useState<Record<number, string>>({});

  // Fetch employees and simulate leave requests loading
  React.useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const response = await fetch("/api/employee", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && active) {
          const mapped = data.employees.map((emp: any) => ({
            id: emp.id,
            employeeId: emp.employeeId,
            fullName: emp.profile?.fullName || "Not Available",
            department: emp.profile?.department || "Not Available",
            designation: emp.profile?.designation || "Not Available",
            attendanceStatus: emp.todayAttendance?.status || "ABSENT",
            checkIn: emp.todayAttendance?.checkIn || null,
            checkOut: emp.todayAttendance?.checkOut || null,
            email: emp.email,
            dob: emp.profile?.dob || null,
            phone: emp.profile?.phone || null,
            address: emp.profile?.address || null,
            emergencyContact: emp.profile?.emergencyContact || null,
            reportingManager: emp.profile?.reportingManager || null,
            dateOfJoining: emp.profile?.dateOfJoining || null,
          }));
          setEmployees(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        if (active) {
          setLeaveRequests(mockPendingLeaveRequests);
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Department list extract
  const departments = ["All", ...new Set(employees.map((e) => e.department))];

  // Leave Actions
  const handleApproveLeave = (id: number) => {
    // Optimistic state change
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
    // Clean error state and remove from list
    setCommentErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Filtered employees listing
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Calculate live statistics
  const totalCount = employees.length;
  const presentCount = employees.filter((e) => e.attendanceStatus === "PRESENT" || e.attendanceStatus === "HALF_DAY").length;
  const pendingCount = leaveRequests.length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Admin portal overview and quick management queue.
        </p>
      </div>

      {/* ─── Metric Cards ────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Employees"
          value={`${totalCount} Active`}
          description="Registered users"
          icon={Users}
        />
        <StatCard
          label="Present Today"
          value={`${presentCount} Present`}
          description="In office / remote logs"
          icon={Clock}
          variant="success"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          description="Requires immediate action"
          icon={ClipboardList}
          variant={pendingCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* ─── Leave Approvals Queue ──────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Leave Approvals Queue ({pendingCount})
          </h2>
          <Link
            to="/admin/leave"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All Requests
          </Link>
        </div>

        {leaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border bg-surface-soft text-center">
            <span className="text-2xl mb-2">🎉</span>
            <p className="text-sm font-semibold text-foreground">
              You are all caught up!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No pending leave requests left to approve or reject.
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
                        ID: {req.employeeId} • Leave type:{" "}
                        <span className="font-semibold">{req.leaveType}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {req.startDate} to {req.endDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total: {req.totalDays} Workday{req.totalDays > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-soft border border-border/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Remarks
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
                      placeholder="Comment is required on rejection, optional on approval..."
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

                  <div className="flex justify-end gap-3.5">
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

      <Separator />

      {/* ─── Employee Directory ─────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Employee Listing Directory ({filteredEmployees.length})
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none min-w-[140px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listing Grid / Table */}
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-surface-soft text-center">
            <p className="text-sm font-semibold text-foreground">
              No matching employees found
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Refine your search term or select another department.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Designation</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-surface-soft/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={emp.fullName} size="sm" />
                          <span className="font-semibold text-foreground">
                            {emp.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {emp.employeeId}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {emp.department}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {emp.designation}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[emp.attendanceStatus as keyof typeof statusColors]}
                        >
                          {emp.attendanceStatus.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
