import * as React from "react";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { MockEmployeeListItem } from "@/data/mock";

interface EnlargedProfileModalProps {
  employee: MockEmployeeListItem;
  onClose: () => void;
}

export function EnlargedProfileModal({
  employee,
  onClose,
}: EnlargedProfileModalProps) {
  const [activeTab, setActiveTab] = React.useState<"resume" | "private" | "salary">("resume");

  // Resume State (Read-only for HR view)
  const [skills] = React.useState<string[]>(["React", "TypeScript", "Tailwind CSS", "Vite", "Node.js"]);
  const [certs] = React.useState<string[]>(["AWS Certified Cloud Practitioner", "Scrum Alliance CSM"]);

  // Salary Calculations State (Interactive)
  const [monthWage, setMonthWage] = React.useState<number>(50000);
  const [pfRate, setPfRate] = React.useState<number>(12);
  const [profTax] = React.useState<number>(200);

  // Stateful Salary Component Rates (%)
  const [basicRate, setBasicRate] = React.useState<number>(50);
  const [hraRate, setHraRate] = React.useState<number>(50);
  const [bonusRate, setBonusRate] = React.useState<number>(8.33);
  const [ltaRate, setLtaRate] = React.useState<number>(8.33);

  // Auto-calculated variables based on monthWage and rates
  const yearlyWage = monthWage * 12;
  const basicSalary = Math.round(monthWage * (basicRate / 100));
  const hra = Math.round(basicSalary * (hraRate / 100));
  const standardAllowance = 4167; // Fixed
  const performanceBonus = Math.round(basicSalary * (bonusRate / 100));
  const lta = Math.round(basicSalary * (ltaRate / 100));

  // Fixed Allowance = Month Wage - Sum of all other components
  const sumOfComponents = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, monthWage - sumOfComponents);

  // PF Contributions
  const pfContribution = Math.round(basicSalary * (pfRate / 100));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-y-auto animate-in fade-in duration-200">
      {/* Top Banner Bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Employee Profile</span>
          <span className="text-sm text-muted-foreground/40">/</span>
          <span className="text-sm font-bold text-foreground">{employee.fullName}</span>
        </div>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Profile Header Block */}
      <div className="border-b border-border bg-surface-soft py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <InitialsAvatar name={employee.fullName} size="lg" className="size-24 border-2 border-border shadow-md" />
            <div className="absolute bottom-0 right-0 size-6 rounded-full bg-success flex items-center justify-center border-2 border-background" title="Status">
              <span className="size-2 rounded-full bg-background" />
            </div>
          </div>

          <div className="flex-1 min-w-0 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{employee.fullName}</h1>
              <p className="text-sm text-muted-foreground font-medium">ID: {employee.employeeId}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <Badge variant="outline" className="text-xs">{employee.designation}</Badge>
                <Badge variant="secondary" className="text-xs bg-accent text-foreground border-0">{employee.department}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6">
              <div>
                <span className="block font-semibold text-foreground/80">Company</span>
                <span className="block mt-0.5">HRMS Corp</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">Location</span>
                <span className="block mt-0.5">San Francisco, CA</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">Reporting Manager</span>
                <span className="block mt-0.5">Alex Rivera</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground/80">Joined Date</span>
                <span className="block mt-0.5">Jan 15, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="border-b border-border bg-background px-6">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("resume")}
            className={cn(
              "py-3.5 text-sm font-semibold border-b-2 transition-all",
              activeTab === "resume"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={cn(
              "py-3.5 text-sm font-semibold border-b-2 transition-all",
              activeTab === "private"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Private Info
          </button>
          <button
            onClick={() => setActiveTab("salary")}
            className={cn(
              "py-3.5 text-sm font-semibold border-b-2 transition-all",
              activeTab === "salary"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Salary Info
          </button>
        </div>
      </div>

      {/* Main Tab Content Panel */}
      <div className="flex-1 bg-surface-soft/40 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Tab 1: Resume */}
          {activeTab === "resume" && (
            <div className="grid gap-6 md:grid-cols-[2fr_1.2fr] items-start">
              {/* Left Column: About & Text sections */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    About Employee
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Jane is a Senior Frontend Engineer with 5+ years of experience specializing in building premium user experiences, designs, and high-performance Web apps. She is dedicated, detail-oriented, and loves collaborating on design systems.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    What I love about my job
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I love bringing interactive user interfaces to life. Bridging the gap between design and engineering, crafting micro-animations, and building performant dashboard products that delight users every day.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    My interests and hobbies
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Exploring coastal hiking trails, photographing architecture, playing acoustic guitar, experimenting with creative coding, and reading sci-fi novels.
                  </p>
                </div>
              </div>

              {/* Right Column: Skills & Certifications */}
              <div className="space-y-6">
                {/* Skills Card */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs py-0.5 border border-border/40">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications Card */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {certs.map((cert) => (
                      <div key={cert} className="text-xs text-muted-foreground p-2 bg-muted/30 border border-border/40 rounded">
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Private Info */}
          {activeTab === "private" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Personal Attributes */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5 text-xs">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Personal Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Date of Birth</span>
                    <span className="block text-foreground font-medium text-sm">March 15, 1995</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Nationality</span>
                    <span className="block text-foreground font-medium text-sm">American</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Personal Email</span>
                    <span className="block text-foreground font-medium text-sm">jane.doe@personal.com</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Gender</span>
                    <span className="block text-foreground font-medium text-sm">Female</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Marital Status</span>
                    <span className="block text-foreground font-medium text-sm">Married</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Date of Joining</span>
                    <span className="block text-foreground font-medium text-sm">Jan 15, 2026</span>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="block font-semibold text-muted-foreground">Residing Address</span>
                    <span className="block text-foreground font-medium text-sm leading-relaxed">
                      42 Elm Street, Apt 3B, San Francisco, CA 94102
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Bank Details */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5 text-xs">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Bank Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Account Number</span>
                    <span className="block text-foreground font-medium text-sm">120987342012</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Bank Name</span>
                    <span className="block text-foreground font-medium text-sm">Chase Bank</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">IFSC Code</span>
                    <span className="block text-foreground font-medium text-sm">CHAS0123456</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">PAN No</span>
                    <span className="block text-foreground font-medium text-sm">ABCDE1234F</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">UAN NO</span>
                    <span className="block text-foreground font-medium text-sm">100987654321</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold text-muted-foreground">Emp Code</span>
                    <span className="block text-foreground font-medium text-sm">{employee.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Salary Info (Interactive Calculator) */}
          {activeTab === "salary" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Wage configuration cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* WAGE INPUTS */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Wage Configuration
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Month Wage (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                        <input
                          type="number"
                          value={monthWage}
                          onChange={(e) => setMonthWage(Math.max(0, parseInt(e.target.value) || 0))}
                          className="h-10 pl-7 pr-3 border border-border bg-background text-foreground text-sm rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground focus:outline-none w-full font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Yearly Wage (Calculated)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/60">₹</span>
                        <input
                          type="text"
                          disabled
                          value={yearlyWage.toLocaleString()}
                          className="h-10 pl-7 pr-3 border border-border bg-muted/40 text-muted-foreground text-sm rounded-md w-full font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE CONFIGS */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
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
                      <span className="block text-sm font-bold text-foreground mt-1">Fixed Monthly Salary structure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SALARY STRUCTURE TABLE */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Salary Components */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Salary Components
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">Basic Salary</span>
                        <span className="text-[10px] text-muted-foreground">Of Month Wage</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            value={basicRate}
                            onChange={(e) => setBasicRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                          />
                          <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                        </div>
                        <span className="font-bold text-foreground min-w-[70px] text-right">₹{basicSalary.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">House Rent Allowance (HRA)</span>
                        <span className="text-[10px] text-muted-foreground">Of Basic Salary</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            value={hraRate}
                            onChange={(e) => setHraRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                          />
                          <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                        </div>
                        <span className="font-bold text-foreground min-w-[70px] text-right">₹{hra.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">Standard Allowance</span>
                        <span className="text-[10px] text-muted-foreground">Fixed amount</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <span className="text-xs text-muted-foreground/60 w-16 text-center font-medium">—</span>
                        <span className="font-bold text-foreground min-w-[70px] text-right">₹{standardAllowance.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">Performance Bonus</span>
                        <span className="text-[10px] text-muted-foreground">Of Basic Salary</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            value={bonusRate}
                            onChange={(e) => setBonusRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                          />
                          <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                        </div>
                        <span className="font-bold text-foreground min-w-[70px] text-right">₹{performanceBonus.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div>
                        <span className="font-semibold text-foreground block">Leave Travel Allowance (LTA)</span>
                        <span className="text-[10px] text-muted-foreground">Of Basic Salary</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            value={ltaRate}
                            onChange={(e) => setLtaRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                          />
                          <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                        </div>
                        <span className="font-bold text-foreground min-w-[70px] text-right">₹{lta.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="font-bold text-primary block">Fixed Allowance</span>
                        <span className="text-[10px] text-muted-foreground">Remaining balance</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <span className="text-xs text-muted-foreground/60 w-16 text-center font-medium">—</span>
                        <span className="font-bold text-primary min-w-[70px] text-right">₹{fixedAllowance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deductions & Funds */}
                <div className="space-y-6">
                  {/* PF Contribution */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Provident Fund (PF) Contribution
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div>
                          <span className="font-semibold text-foreground block">Employee PF Contribution</span>
                          <span className="text-[10px] text-muted-foreground">Of Basic Salary</span>
                        </div>
                        <div className="flex items-center gap-3.5">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="0.01"
                              value={pfRate}
                              onChange={(e) => setPfRate(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                            />
                            <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                          </div>
                          <span className="font-bold text-foreground min-w-[70px] text-right">₹{pfContribution.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground block">Employer PF Contribution</span>
                          <span className="text-[10px] text-muted-foreground">Of Basic Salary</span>
                        </div>
                        <div className="flex items-center gap-3.5">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="0.01"
                              value={pfRate}
                              onChange={(e) => setPfRate(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="h-7 w-16 text-center border border-border bg-background text-foreground text-xs rounded-md focus:border-foreground focus:outline-none pr-4 font-semibold"
                            />
                            <span className="absolute right-1.5 text-[10px] text-muted-foreground">%</span>
                          </div>
                          <span className="font-bold text-foreground min-w-[70px] text-right">₹{pfContribution.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Deductions */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Tax Deductions
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-foreground block">Professional Tax</span>
                        <span className="text-[10px] text-muted-foreground">Deducted from gross</span>
                      </div>
                      <span className="font-bold text-foreground">₹{profTax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
