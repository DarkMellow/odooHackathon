import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  DollarSign,
  Shield,
  Download,
} from "lucide-react";

interface ProfileData {
  id: number;
  userId: number;
  fullName: string;
  dob: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  profilePictureUrl: string | null;
  department: string | null;
  designation: string | null;
  dateOfJoining: string | null;
  reportingManager: string | null;
  user: {
    id: number;
    employeeId: string;
    email: string;
    role: string;
    isVerified: boolean;
    salaryStructures: Array<{
      id: number;
      userId: number;
      baseSalary: string;
      allowances: Array<{ label: string; amount: number }> | null;
      deductions: Array<{ label: string; amount: number }> | null;
      netPay: string;
      effectiveDate: string;
    }>;
  };
}

export function EmployeeProfilePage() {
  const { checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = React.useState<"personal" | "job" | "salary" | "documents">("personal");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Form fields
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [emergencyContact, setEmergencyContact] = React.useState("");

  const fetchProfile = React.useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/employee/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setPhone(data.profile.phone || "");
        setAddress(data.profile.address || "");
        setEmergencyContact(data.profile.emergencyContact || "");
        
        if (data.profile.dob) {
          try {
            const formattedDob = new Date(data.profile.dob).toISOString().split("T")[0];
            setDob(formattedDob);
          } catch (e) {
            setDob("");
          }
        } else {
          setDob("");
        }
      } else {
        setError(data.message || "Failed to load profile details.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching profile details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim() || null,
          address: address.trim() || null,
          dob: dob || null,
          emergencyContact: emergencyContact.trim() || null,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
        setProfile(data.profile);
        setPhone(data.profile.phone || "");
        setAddress(data.profile.address || "");
        setEmergencyContact(data.profile.emergencyContact || "");
        
        if (data.profile.dob) {
          try {
            const formattedDob = new Date(data.profile.dob).toISOString().split("T")[0];
            setDob(formattedDob);
          } catch (e) {
            setDob("");
          }
        } else {
          setDob("");
        }
        
        // Synchronize global application state (sidebar details, layout info)
        await checkAuth();
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not Provided";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-10 w-64 rounded-pill" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-surface-soft text-center max-w-4xl mx-auto">
        <p className="text-sm font-semibold text-foreground">Profile not found</p>
        <p className="text-xs text-muted-foreground mt-0.5">Please check again later.</p>
      </div>
    );
  }

  const latestSalary = profile.user?.salaryStructures?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      {/* ─── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and update your job information and personal credentials.
        </p>
      </div>

      {/* ─── Hero Banner Card ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <InitialsAvatar
            name={profile.fullName}
            imageUrl={profile.profilePictureUrl}
            size="lg"
            className="size-24"
          />
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate">
            {profile.fullName}
          </h2>
          <p className="text-sm text-muted-foreground font-semibold mt-0.5">
            {profile.designation} • {profile.department}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3 text-xs text-muted-foreground">
            <span>ID: <strong className="text-foreground">{profile.user?.employeeId}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>Joined: <strong className="text-foreground">{formatDate(profile.dateOfJoining)}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── Alerts ──────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-success/15 border border-success/20 text-success text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* ─── Tab Selectors ────────────────────────────────── */}
      <div className="bg-surface-soft border border-border p-1 rounded-lg flex gap-1 overflow-x-auto w-full sm:w-auto max-w-lg">
        <button
          onClick={() => setActiveTab("personal")}
          className={
            activeTab === "personal"
              ? "bg-canvas text-foreground shadow-sm rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              : "text-muted hover:text-foreground px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          }
        >
          <User className="size-3.5" />
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab("job")}
          className={
            activeTab === "job"
              ? "bg-canvas text-foreground shadow-sm rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              : "text-muted hover:text-foreground px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          }
        >
          <Briefcase className="size-3.5" />
          Job Info
        </button>
        <button
          onClick={() => setActiveTab("salary")}
          className={
            activeTab === "salary"
              ? "bg-canvas text-foreground shadow-sm rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              : "text-muted hover:text-foreground px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          }
        >
          <DollarSign className="size-3.5" />
          Salary Structure
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={
            activeTab === "documents"
              ? "bg-canvas text-foreground shadow-sm rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              : "text-muted hover:text-foreground px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          }
        >
          <FileText className="size-3.5" />
          Documents
        </button>
      </div>

      {/* ─── Tab Content ─────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs min-h-[300px]">
        {/* Personal Details Tab */}
        {activeTab === "personal" && (
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-2 mb-4">
              Edit Personal Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Full Name
                </label>
                <div className="flex h-10 items-center px-3.5 border border-border bg-surface-soft text-muted-foreground text-sm rounded-md select-none w-full">
                  {profile.fullName}
                </div>
                <span className="text-[10px] text-muted block px-1">Read-only. Contact HR to change.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Email Address
                </label>
                <div className="flex h-10 items-center px-3.5 border border-border bg-surface-soft text-muted-foreground text-sm rounded-md select-none w-full">
                  {profile.user?.email}
                </div>
                <span className="text-[10px] text-muted block px-1">Read-only. Contact HR to change.</span>
              </div>

              <div className="space-y-1">
                <label htmlFor="dob" className="text-xs font-semibold text-muted-foreground block">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={isSaving}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="emergencyContact" className="text-xs font-semibold text-muted-foreground block">
                  Emergency Contact
                </label>
                <input
                  id="emergencyContact"
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Contact Name — Relationship — Phone"
                  disabled={isSaving}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground block">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={isSaving}
                  className="h-10 px-3.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="address" className="text-xs font-semibold text-muted-foreground block">
                  Home Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP Code"
                  disabled={isSaving}
                  className="px-3.5 py-2.5 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full min-h-[100px] transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border mt-6">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Job Info Tab */}
        {activeTab === "job" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-2 mb-4">
              Employment Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Employee ID</span>
                <p className="text-sm font-semibold text-foreground">{profile.user?.employeeId}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Role Assignment</span>
                <p className="text-sm font-semibold text-foreground">
                  <Badge variant="outline" className="border-border">
                    {profile.user?.role}
                  </Badge>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Department</span>
                <p className="text-sm font-semibold text-foreground">{profile.department || "Not Specified"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Designation</span>
                <p className="text-sm font-semibold text-foreground">{profile.designation || "Not Specified"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Date of Joining</span>
                <p className="text-sm font-semibold text-foreground">{formatDate(profile.dateOfJoining)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Reporting Manager</span>
                <p className="text-sm font-semibold text-foreground">{profile.reportingManager || "None Assigned"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === "salary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Salary Breakdowns
              </h3>
              {latestSalary && (
                <span className="text-xs text-muted-foreground font-medium">
                  Effective Date: {formatDate(latestSalary.effectiveDate)}
                </span>
              )}
            </div>

            {!latestSalary ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-surface-soft border border-border/40 text-center text-xs text-muted-foreground">
                <p>No active salary structure record found.</p>
                <p className="mt-0.5">Please contact Human Resources to configure payroll details.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Core Net Pay display */}
                <div className="p-4 bg-muted/20 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Net Payout</p>
                    <p className="text-2xl font-extrabold text-foreground mt-0.5">
                      ${Number(latestSalary.netPay).toLocaleString()} <span className="text-xs font-medium text-muted-foreground">/ month</span>
                    </p>
                  </div>
                  <Badge className="bg-success/15 text-success border-0 py-1 px-3">
                    Active Structure
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Earnings */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Earnings & Allowances
                    </h4>
                    <div className="border border-border/60 rounded-lg divide-y divide-border/40 text-sm">
                      <div className="flex justify-between p-3">
                        <span className="text-foreground">Base Salary</span>
                        <span className="font-semibold text-foreground">${Number(latestSalary.baseSalary).toLocaleString()}</span>
                      </div>
                      {latestSalary.allowances?.map((allow, idx) => (
                        <div key={idx} className="flex justify-between p-3">
                          <span className="text-muted-foreground">{allow.label}</span>
                          <span className="font-semibold text-foreground">${allow.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Deductions
                    </h4>
                    <div className="border border-border/60 rounded-lg divide-y divide-border/40 text-sm">
                      {!latestSalary.deductions || latestSalary.deductions.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">
                          No active deductions.
                        </div>
                      ) : (
                        latestSalary.deductions.map((ded, idx) => (
                          <div key={idx} className="flex justify-between p-3">
                            <span className="text-muted-foreground">{ded.label}</span>
                            <span className="font-semibold text-destructive">${ded.amount.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-2 mb-4">
              Signed Contracts & Documents
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                    <Shield className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Employment Agreement.pdf</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Signed • Jan 15, 2026</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="size-7 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  title="Download File"
                >
                  <Download className="size-3.5" />
                </button>
              </div>

              <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                    <FileText className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">NDA & Intellectual Property.pdf</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Signed • Jan 15, 2026</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="size-7 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  title="Download File"
                >
                  <Download className="size-3.5" />
                </button>
              </div>

              <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                    <Calendar className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Employee Handbook 2026.pdf</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Updated • Jan 01, 2026</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="size-7 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  title="Download File"
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeProfilePage;
