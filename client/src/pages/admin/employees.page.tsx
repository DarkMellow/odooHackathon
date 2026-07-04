import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  Search,
  Plus,
  X as XIcon,
  Maximize2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  mockEmployees,
} from "@/data/mock";
import type {
  MockEmployeeListItem,
} from "@/data/mock";

const statusColors = {
  PRESENT: "bg-success/15 text-success border-0",
  ABSENT: "bg-destructive/15 text-destructive border-0",
  HALF_DAY: "bg-warning/15 text-warning border-0",
  LEAVE: "bg-info/15 text-info border-0",
} as const;

const BANNER_COLORS = [
  "bg-badge-orange",
  "bg-badge-pink",
  "bg-badge-violet",
  "bg-badge-emerald",
] as const;

function getBannerColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BANNER_COLORS[Math.abs(hash) % BANNER_COLORS.length];
}

export function EmployeesPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState("All");
  const [employees, setEmployees] = React.useState<MockEmployeeListItem[]>([]);
  
  // Modal State
  const [selectedEmployee, setSelectedEmployee] = React.useState<MockEmployeeListItem | null>(null);
  const [newEmployeeModalOpen, setNewEmployeeModalOpen] = React.useState(false);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = React.useState("");
  const [newEmpId, setNewEmpId] = React.useState("");
  const [newEmpDept, setNewEmpDept] = React.useState("");
  const [newEmpDesg, setNewEmpDesg] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setEmployees(mockEmployees);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const departments = ["All", ...new Set(employees.map((e) => e.department))];

  // Actions
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpId || !newEmpDept || !newEmpDesg) return;

    const newEmp: MockEmployeeListItem = {
      id: Date.now(),
      employeeId: newEmpId,
      fullName: newEmpName,
      department: newEmpDept,
      designation: newEmpDesg,
      attendanceStatus: "ABSENT",
      checkIn: null,
      checkOut: null,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setNewEmployeeModalOpen(false);
    // Reset form
    setNewEmpName("");
    setNewEmpId("");
    setNewEmpDept("");
    setNewEmpDesg("");
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalCount = employees.length;
  const presentCount = employees.filter((e) => e.attendanceStatus === "PRESENT" || e.attendanceStatus === "HALF_DAY").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Employees
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your organization members and directory.
          </p>
        </div>
        <Button
          onClick={() => setNewEmployeeModalOpen(true)}
          className="bg-primary hover:bg-primary/95 gap-1.5 h-9"
        >
          <Plus className="size-4" />
          NEW
        </Button>
      </div>

      {/* ─── Metrics ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Employees"
          value={`${totalCount} Active`}
          description="Members registered"
          icon={Users}
        />
        <StatCard
          label="Present Today"
          value={`${presentCount} Active`}
          description="Logged checked in today"
          icon={Clock}
          variant="success"
        />
      </div>

      {/* ─── Filters & Search ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 pr-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
          />
        </div>
        <div>
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

      {/* ─── Cards Grid ──────────────────────────────────── */}
      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-surface-soft text-center">
          <p className="text-sm font-semibold text-foreground">No employees found</p>
          <p className="text-xs text-muted-foreground mt-0.5">Try altering your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 space-y-3 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border/80"
            >
              <div className="flex items-center gap-3">
                <InitialsAvatar name={emp.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                    {emp.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {emp.designation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t pt-3 border-border/40">
                <span className="text-muted-foreground">{emp.department}</span>
                <Badge className={statusColors[emp.attendanceStatus]}>
                  {emp.attendanceStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Discord Style Modal ──────────────────────────── */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedEmployee(null)}>
          <div
            className="relative w-full max-w-[420px] bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner using matching color */}
            <div className={`h-24 ${getBannerColorFromName(selectedEmployee.fullName)} relative m-1 rounded-md`}>
              {/* Maximize & Close buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  onClick={() => alert(`Enlarged profile panel for ${selectedEmployee.fullName}`)}
                  className="size-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                  title="Enlarge details panel"
                >
                  <Maximize2 className="size-3.5" />
                </button>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="size-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="px-4 pb-5 relative">
              {/* Avatar offset */}
              <div className="-mt-11 mb-3">
                <div className="inline-block rounded-full border-[6px] border-card bg-card">
                  <InitialsAvatar name={selectedEmployee.fullName} size="lg" className="size-20" />
                </div>
              </div>

              {/* User Identity Box */}
              <div className="bg-muted/40 border border-border/40 rounded-lg p-3 space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedEmployee.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {selectedEmployee.employeeId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={cn(statusColors[selectedEmployee.attendanceStatus], "text-[10px] font-bold py-0.5")}>
                    {selectedEmployee.attendanceStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined Jan 2026
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* About me info */}
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    About Employee
                  </h4>
                  <div className="space-y-2 text-foreground/90">
                    <p className="flex items-center gap-2">
                      <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedEmployee.designation} ({selectedEmployee.department})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedEmployee.fullName.toLowerCase().replace(" ", "")}@company.com</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 text-muted-foreground shrink-0" />
                      <span>+1 (555) 012-3456</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                      <span>42 Elm Street, San Francisco, CA</span>
                    </p>
                  </div>
                </div>

                {/* HR Note */}
                <div className="border-t border-border/60 pt-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Direct Manager
                  </h4>
                  <p className="text-foreground/90 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Alex Rivera
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create New User Modal ─── */}
      {newEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">
                Create New Employee
              </h3>
              <button
                onClick={() => setNewEmployeeModalOpen(false)}
                className="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Employee ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="EMP202610"
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Department
                </label>
                <input
                  type="text"
                  required
                  placeholder="Engineering"
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="Senior Software Engineer"
                  value={newEmpDesg}
                  onChange={(e) => setNewEmpDesg(e.target.value)}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewEmployeeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Employee</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
