import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { useAuthStore } from "@/stores/auth.store";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Clock,
  CalendarDays,
  User as UserIcon,
  Banknote,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ExtendedProfile {
  about: string;
  loveAboutJob: string;
  interestsHobbies: string;
  skills: string[];
  certs: string[];
  dob: string;
  nationality: string;
  personalEmail: string;
  gender: string;
  maritalStatus: string;
  phone: string;
  address: string;
  emergencyContact: string;
  bankAccount: string;
  bankName: string;
  ifscCode: string;
  panNo: string;
  uanNo: string;
}

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const { checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<"resume" | "private" | "salary">("resume");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Profile data state
  const [profileData, setProfileData] = React.useState<ExtendedProfile>({
    about: "",
    loveAboutJob: "",
    interestsHobbies: "",
    skills: [],
    certs: [],
    dob: "",
    nationality: "",
    personalEmail: "",
    gender: "",
    maritalStatus: "",
    phone: "",
    address: "",
    emergencyContact: "",
    bankAccount: "",
    bankName: "",
    ifscCode: "",
    panNo: "",
    uanNo: "",
  });

  // Temporarily holds changes during edit mode
  const [editedData, setEditedData] = React.useState<ExtendedProfile | null>(null);

  // Skill input field state
  const [skillInput, setSkillInput] = React.useState("");
  // Cert input field state
  const [certInput, setCertInput] = React.useState("");

  // Initial load
  React.useEffect(() => {
    if (!user) return;

    const localKey = `profile_extended_${user.id}`;
    const cached = localStorage.getItem(localKey);
    let initialExtended: Partial<ExtendedProfile> = {};

    if (cached) {
      try {
        initialExtended = JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached profile", e);
      }
    }

    const defaultDob = user.profile.dob
      ? new Date(user.profile.dob).toISOString().split("T")[0]
      : "1995-03-15";

    setProfileData({
      about:
        initialExtended.about ??
        "Jane is a Senior Frontend Engineer with 5+ years of experience specializing in building premium user experiences, designs, and high-performance Web apps. She is dedicated, detail-oriented, and loves collaborating on design systems.",
      loveAboutJob:
        initialExtended.loveAboutJob ??
        "I love bringing interactive user interfaces to life. Bridging the gap between design and engineering, crafting micro-animations, and building performant dashboard products that delight users every day.",
      interestsHobbies:
        initialExtended.interestsHobbies ??
        "Exploring coastal hiking trails, photographing architecture, playing acoustic guitar, experimenting with creative coding, and reading sci-fi novels.",
      skills: initialExtended.skills ?? [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Vite",
        "Node.js",
      ],
      certs: initialExtended.certs ?? [
        "AWS Certified Cloud Practitioner",
        "Scrum Alliance CSM",
      ],
      dob: initialExtended.dob ?? defaultDob,
      nationality: initialExtended.nationality ?? "American",
      personalEmail: initialExtended.personalEmail ?? user.email,
      gender: initialExtended.gender ?? "Female",
      maritalStatus: initialExtended.maritalStatus ?? "Married",
      phone: user.profile.phone ?? initialExtended.phone ?? "+1 (555) 012-3456",
      address:
        user.profile.address ??
        initialExtended.address ??
        "42 Elm Street, Apt 3B, San Francisco, CA 94102",
      emergencyContact:
        user.profile.emergencyContact ??
        initialExtended.emergencyContact ??
        "John Doe — +1 (555) 987-6543",
      bankAccount: initialExtended.bankAccount ?? "120987342012",
      bankName: initialExtended.bankName ?? "Chase Bank",
      ifscCode: initialExtended.ifscCode ?? "CHAS0123456",
      panNo: initialExtended.panNo ?? "ABCDE1234F",
      uanNo: initialExtended.uanNo ?? "100987654321",
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  // Sync state with edit buffer
  React.useEffect(() => {
    if (isEditing) {
      setEditedData({ ...profileData });
    } else {
      setEditedData(null);
    }
  }, [isEditing, profileData]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Please log in to view your profile.</p>
      </div>
    );
  }

  // Handle value modifications in edit mode
  const handleChange = (
    field: keyof ExtendedProfile,
    value: string | string[]
  ) => {
    if (!editedData) return;
    setEditedData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    if (!editedData) return;
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // 1. Persist the database-backed fields via the server endpoint
      const response = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: editedData.phone,
          address: editedData.address,
          profilePictureUrl: user.profile.profilePictureUrl,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save database profile properties");
      }

      // 2. Persist mock fields in localStorage
      const localKey = `profile_extended_${user.id}`;
      localStorage.setItem(localKey, JSON.stringify(editedData));

      // 3. Update the frontend in-memory state
      setProfileData(editedData);

      // 4. Update standard auth context variables from the server
      await checkAuth();

      setSaveSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Auto dismiss banner
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Something went wrong saving the profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add tag handlers
  const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (!editedData) return;
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") return;
    e.preventDefault();

    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (!editedData.skills.includes(trimmed)) {
      handleChange("skills", [...editedData.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    if (!editedData) return;
    handleChange(
      "skills",
      editedData.skills.filter((sk) => sk !== skillToRemove)
    );
  };

  const addCert = () => {
    if (!editedData) return;
    const trimmed = certInput.trim();
    if (!trimmed) return;

    if (!editedData.certs.includes(trimmed)) {
      handleChange("certs", [...editedData.certs, trimmed]);
    }
    setCertInput("");
  };

  const removeCert = (certToRemove: string) => {
    if (!editedData) return;
    handleChange(
      "certs",
      editedData.certs.filter((c) => c !== certToRemove)
    );
  };

  // Salary tab constants (Calculations derived from static configurations)
  const salaryCalculations = (() => {
    const monthWage = 50000;
    const pfRate = 12;
    const basicRate = 50;
    const hraRate = 50;
    const bonusRate = 8.33;
    const ltaRate = 8.33;
    const profTax = 200;

    const yearlyWage = monthWage * 12;
    const basicSalary = Math.round(monthWage * (basicRate / 100));
    const hra = Math.round(basicSalary * (hraRate / 100));
    const standardAllowance = 4167;
    const performanceBonus = Math.round(basicSalary * (bonusRate / 100));
    const lta = Math.round(basicSalary * (ltaRate / 100));

    const sumOfComponents = basicSalary + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, monthWage - sumOfComponents);
    const pfContribution = Math.round(basicSalary * (pfRate / 100));

    return {
      monthWage,
      yearlyWage,
      basicSalary,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
      pfContribution,
      profTax,
    };
  })();

  const defaultDoj = user.profile.dateOfJoining
    ? new Date(user.profile.dateOfJoining).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Jan 15, 2026";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48 md:col-span-2 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and update your personal info and salary structures.
          </p>
        </div>

        {activeTab !== "salary" && (
          <div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90 gap-1.5 h-9"
              >
                <Edit2 className="size-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="h-9"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-success text-success-foreground hover:bg-success/90 gap-1.5 h-9 font-semibold"
                  disabled={isSaving}
                >
                  <Save className="size-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Alert Messages ──────────────────────────────── */}
      {saveSuccess && (
        <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success/10 p-3.5 text-xs font-semibold text-success animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─── Profile Header Block ────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface-soft py-6 px-5 sm:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <InitialsAvatar
              name={user.profile.fullName}
              imageUrl={user.profile.profilePictureUrl}
              size="lg"
              className="size-20 border border-border shadow-xs"
            />
            <div
              className="absolute bottom-0 right-0 size-5 rounded-full bg-success flex items-center justify-center border-2 border-background"
              title="Status: Active"
            >
              <span className="size-1.5 rounded-full bg-background" />
            </div>
          </div>

          <div className="flex-1 min-w-0 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {user.profile.fullName}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Employee ID: {user.employeeId}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                <Badge variant="outline" className="text-[10px] py-0.5 px-2">
                  {user.profile.designation ?? "Designation"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] py-0.5 px-2 bg-accent text-foreground border-0"
                >
                  {user.profile.department ?? "Department"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-muted-foreground border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6">
              <div>
                <span className="block font-semibold text-foreground/80">Company</span>
                <span className="block mt-0.5">HRMS Corp</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">Location</span>
                <span className="block mt-0.5">San Francisco, CA</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">
                  Reporting Manager
                </span>
                <span className="block mt-0.5">
                  {user.profile.reportingManager ?? "Alex Rivera"}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">Joined Date</span>
                <span className="block mt-0.5">{defaultDoj}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs Navigation ────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="flex gap-4">
          {(["resume", "private", "salary"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setIsEditing(false);
                setActiveTab(tab);
              }}
              className={cn(
                "py-3 text-sm font-semibold border-b-2 transition-all capitalize",
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "private"
                ? "Private Info"
                : tab === "salary"
                  ? "Salary Info"
                  : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Panel Content ──────────────────────────── */}
      <div className="flex-1">
        {/* TAB 1: RESUME */}
        {activeTab === "resume" && (
          <div className="grid gap-6 md:grid-cols-[2fr_1.2fr] items-start">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  About Me
                </h3>
                {!isEditing ? (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {profileData.about}
                  </p>
                ) : (
                  <textarea
                    value={editedData?.about ?? ""}
                    onChange={(e) => handleChange("about", e.target.value)}
                    className="w-full text-xs text-foreground p-3 border border-border rounded-md bg-background focus:ring-1 focus:ring-foreground focus:outline-none min-h-[100px] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  What I love about my job
                </h3>
                {!isEditing ? (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {profileData.loveAboutJob}
                  </p>
                ) : (
                  <textarea
                    value={editedData?.loveAboutJob ?? ""}
                    onChange={(e) => handleChange("loveAboutJob", e.target.value)}
                    className="w-full text-xs text-foreground p-3 border border-border rounded-md bg-background focus:ring-1 focus:ring-foreground focus:outline-none min-h-[100px] resize-none"
                    placeholder="What details of your day-to-day inspire you?"
                  />
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  My interests and hobbies
                </h3>
                {!isEditing ? (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {profileData.interestsHobbies}
                  </p>
                ) : (
                  <textarea
                    value={editedData?.interestsHobbies ?? ""}
                    onChange={(e) => handleChange("interestsHobbies", e.target.value)}
                    className="w-full text-xs text-foreground p-3 border border-border rounded-md bg-background focus:ring-1 focus:ring-foreground focus:outline-none min-h-[100px] resize-none"
                    placeholder="List your hobbies and personal interests..."
                  />
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Skills Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Skills
                </h3>

                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      className="h-8 flex-1 text-xs border border-border bg-background rounded-md px-2.5 focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                    <Button onClick={addSkill} className="h-8 px-3 text-xs bg-primary text-primary-foreground font-semibold">
                      Add
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {(isEditing ? editedData?.skills : profileData.skills)?.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs py-0.5 pl-2 pr-1 flex items-center gap-1 border border-border/40"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-muted rounded-full p-0.5 focus:outline-none"
                        >
                          <X className="size-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Certifications
                </h3>

                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a certification"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      className="h-8 flex-1 text-xs border border-border bg-background rounded-md px-2.5 focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                    <Button onClick={addCert} className="h-8 px-3 text-xs bg-primary text-primary-foreground font-semibold">
                      Add
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {(isEditing ? editedData?.certs : profileData.certs)?.map((cert) => (
                    <div
                      key={cert}
                      className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/20 border border-border/40 rounded-md"
                    >
                      <span>{cert}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeCert(cert)}
                          className="hover:text-destructive p-1 rounded transition-colors focus:outline-none"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVATE INFO */}
        {activeTab === "private" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Details */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4 text-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                Personal Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Date of Birth</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.dob
                        ? new Date(profileData.dob).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "March 15, 1995"}
                    </span>
                  ) : (
                    <input
                      type="date"
                      value={editedData?.dob ?? ""}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      className="h-9 px-2 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Nationality</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.nationality}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.nationality ?? ""}
                      onChange={(e) => handleChange("nationality", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Personal Email</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.personalEmail}
                    </span>
                  ) : (
                    <input
                      type="email"
                      value={editedData?.personalEmail ?? ""}
                      onChange={(e) => handleChange("personalEmail", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Gender</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.gender}
                    </span>
                  ) : (
                    <select
                      value={editedData?.gender ?? ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="h-9 px-2 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Marital Status</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.maritalStatus}
                    </span>
                  ) : (
                    <select
                      value={editedData?.maritalStatus ?? ""}
                      onChange={(e) => handleChange("maritalStatus", e.target.value)}
                      className="h-9 px-2 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Date of Joining</span>
                  <span className="block text-foreground font-medium text-sm text-muted-foreground/80">
                    {defaultDoj}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Phone Number</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.phone}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.phone ?? ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Emergency Contact</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.emergencyContact}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.emergencyContact ?? ""}
                      onChange={(e) => handleChange("emergencyContact", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="block font-semibold text-muted-foreground">Residing Address</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm leading-relaxed">
                      {profileData.address}
                    </span>
                  ) : (
                    <textarea
                      value={editedData?.address ?? ""}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full text-xs text-foreground p-2.5 border border-border rounded bg-background focus:ring-1 focus:ring-foreground focus:outline-none resize-none min-h-[60px]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4 text-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                Bank Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Account Number</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.bankAccount}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.bankAccount ?? ""}
                      onChange={(e) => handleChange("bankAccount", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Bank Name</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm">
                      {profileData.bankName}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.bankName ?? ""}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">IFSC Code</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm font-mono">
                      {profileData.ifscCode}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.ifscCode ?? ""}
                      onChange={(e) => handleChange("ifscCode", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full font-mono focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">PAN No</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm font-mono">
                      {profileData.panNo}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.panNo ?? ""}
                      onChange={(e) => handleChange("panNo", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full font-mono focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">UAN NO</span>
                  {!isEditing ? (
                    <span className="block text-foreground font-medium text-sm font-mono">
                      {profileData.uanNo}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editedData?.uanNo ?? ""}
                      onChange={(e) => handleChange("uanNo", e.target.value)}
                      className="h-9 px-2.5 border border-border rounded bg-background text-xs w-full font-mono focus:ring-1 focus:ring-foreground focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-muted-foreground">Emp Code</span>
                  <span className="block text-foreground font-medium text-sm text-muted-foreground/80 font-mono">
                    {user.employeeId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALARY INFO (Read-only) */}
        {activeTab === "salary" && (
          <div className="space-y-6">
            {/* Wage & Schedule config cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* WAGE DETAILS */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Wage Details
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="font-semibold text-muted-foreground">Monthly Wage (INR)</span>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.monthWage.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">Yearly Wage (Calculated)</span>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.yearlyWage.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Working Schedule
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-semibold text-muted-foreground">Workdays per week</span>
                    <span className="block text-sm font-bold text-foreground mt-1">5 Days</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-muted-foreground">Work Hours / Break Time</span>
                    <span className="block text-sm font-bold text-foreground mt-1">8 Hrs / 1 Hr</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-semibold text-muted-foreground">Wage Policy Type</span>
                    <span className="block text-sm font-bold text-foreground mt-1">
                      Fixed Monthly Salary structure
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SALARY STRUCTURE */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Salary Components */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Salary Components
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div>
                      <span className="font-semibold text-foreground block">Basic Salary</span>
                      <span className="text-[10px] text-muted-foreground">50% of Month Wage</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.basicSalary.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div>
                      <span className="font-semibold text-foreground block">House Rent Allowance (HRA)</span>
                      <span className="text-[10px] text-muted-foreground">50% of Basic Salary</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.hra.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div>
                      <span className="font-semibold text-foreground block">Standard Allowance</span>
                      <span className="text-[10px] text-muted-foreground">Fixed amount</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.standardAllowance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div>
                      <span className="font-semibold text-foreground block">Performance Bonus</span>
                      <span className="text-[10px] text-muted-foreground">8.33% of Basic Salary</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.performanceBonus.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div>
                      <span className="font-semibold text-foreground block">Leave Travel Allowance (LTA)</span>
                      <span className="text-[10px] text-muted-foreground">8.33% of Basic Salary</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.lta.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-bold text-primary block">Fixed Allowance</span>
                      <span className="text-[10px] text-muted-foreground">Remaining balance</span>
                    </div>
                    <span className="font-bold text-primary text-sm">
                      ₹{salaryCalculations.fixedAllowance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions & Funds */}
              <div className="space-y-6">
                {/* PF Contribution */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs font-sans">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Provident Fund (PF) Contribution
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">Employee PF Contribution</span>
                        <span className="text-[10px] text-muted-foreground">12% of Basic Salary</span>
                      </div>
                      <span className="font-bold text-foreground text-sm">
                        ₹{salaryCalculations.pfContribution.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-foreground block">Employer PF Contribution</span>
                        <span className="text-[10px] text-muted-foreground">12% of Basic Salary</span>
                      </div>
                      <span className="font-bold text-foreground text-sm">
                        ₹{salaryCalculations.pfContribution.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tax Deductions */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Tax Deductions
                  </h3>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">Professional Tax</span>
                      <span className="text-[10px] text-muted-foreground">Fixed monthly deduction</span>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      ₹{salaryCalculations.profTax.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeProfilePage;
