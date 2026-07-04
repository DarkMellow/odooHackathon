import * as React from "react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Banknote,
  Search,
  Maximize2,
  X as XIcon,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { EnlargedProfileModal } from "@/components/dashboard/enlarged-profile-modal";

// Mock Salaries Map
const employeeSalaries: Record<number, number> = {
  1: 4820, // Jane Doe
  3: 5200, // John Smith
  4: 4600, // Emily Davis
  5: 4200, // Michael Brown
  6: 4500, // Sarah Connor
};

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

export function SalaryManagementPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any | null>(null);
  const [enlargedEmployee, setEnlargedEmployee] = React.useState<any | null>(null);

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
            netPay: emp.salaryStructures?.[0]?.netPay || null,
          }));
          setEmployees(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Math Calculations
  const salaryValues = employees.map(emp => emp.netPay || employeeSalaries[emp.id] || 4000);
  const totalSalary = salaryValues.reduce((sum, val) => sum + val, 0);
  const averageSalary = salaryValues.length > 0 ? Math.round(totalSalary / salaryValues.length) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[88px] rounded-xl" />
          <Skeleton className="h-[88px] rounded-xl" />
        </div>
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
          Salary Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review payroll breakdowns and member salary structures.
        </p>
      </div>

      {/* ─── Top Metric Cards ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Salary Per Month"
          value={`$${totalSalary.toLocaleString()}`}
          description="Net cumulative payout"
          icon={Banknote}
        />
        <StatCard
          label="Average Salary Per Month"
          value={`$${averageSalary.toLocaleString()}`}
          description="Average employee net pay"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      {/* ─── Search bar ──────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Search employees or IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 pr-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full"
        />
      </div>

      {/* ─── Employees Salary Table ──────────────────────── */}
      <div className="border border-border bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-surface-soft text-muted-foreground border-b border-border text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5 text-right">Net Monthly Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEmployees.map((emp) => {
                const salary = employeeSalaries[emp.id] || 4000;
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-surface-soft/40 transition-colors cursor-pointer"
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
                      {emp.designation}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {emp.department}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">
                      ${salary.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Discord Style Modal ──────────────────────────── */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedEmployee(null)}>
          <div
            className="relative w-full max-w-[420px] bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className={`h-24 ${getBannerColorFromName(selectedEmployee.fullName)} relative m-1 rounded-md`}>
              {/* Maximize & Close buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  onClick={() => {
                    setEnlargedEmployee(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
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
                  <Badge className={cn(statusColors[selectedEmployee.attendanceStatus as keyof typeof statusColors], "text-[10px] font-bold py-0.5")}>
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

                {/* Manager info */}
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

      {/* ─── Enlarged Profile Modal ───────────────────────── */}
      {enlargedEmployee && (
        <EnlargedProfileModal
          employee={enlargedEmployee}
          onClose={() => setEnlargedEmployee(null)}
        />
      )}
    </div>
  );
}

export default SalaryManagementPage;
