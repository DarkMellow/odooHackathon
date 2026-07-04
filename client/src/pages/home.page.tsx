import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Home,
  User,
  Clock,
  CalendarDays,
  Users,
  ClipboardList,
  Banknote,
  Route,
} from "lucide-react";

const linkGroups = [
  {
    title: "Public Pages",
    description: "Authentication & verification views",
    items: [
      { label: "Sign In", to: "/signin", icon: LogIn },
      { label: "Sign Up", to: "/signup", icon: UserPlus },
      { label: "Forgot Password", to: "/forgot-password", icon: KeyRound },
      { label: "Verify Email", to: "/verify-email", icon: Mail },
    ],
  },
  {
    title: "Employee Portal",
    description: "Self-service workspaces",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: Home },
      { label: "Profile", to: "/profile", icon: User },
      { label: "Attendance", to: "/attendance", icon: Clock },
      { label: "Leave Requests", to: "/leave", icon: CalendarDays },
    ],
  },
  {
    title: "Admin Console",
    description: "HR management screens",
    items: [
      { label: "Employees", to: "/admin/employees", icon: Users },
      { label: "Attendance Logs", to: "/admin/attendance", icon: Clock },
      { label: "Leave Approvals", to: "/admin/leave", icon: ClipboardList },
      { label: "Salary Rules", to: "/admin/payroll", icon: Banknote },
    ],
  },
];

export function HomePage() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12 space-y-12">
      {/* Decorative ambient background glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div 
          className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-primary/15 to-badge-violet/20 blur-[80px] md:blur-[120px] animate-pulse" 
          style={{ animationDuration: '8s' }} 
        />
        <div 
          className="absolute w-[250px] h-[250px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-br from-success/10 to-info/15 blur-[60px] md:blur-[100px] animate-pulse" 
          style={{ animationDuration: '12s', animationDelay: '2s' }} 
        />
      </div>

      {/* Hero Card Container */}
      <div className="w-full max-w-lg bg-card/45 backdrop-blur-xl border border-border/50 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-primary/5 dark:hover:shadow-primary/10 hover:border-border/80 transition-all duration-500 flex flex-col items-center text-center space-y-8 animate-in fade-in duration-500">
        
        {/* Logo and Brand */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary select-none animate-bounce" style={{ animationDuration: '3s' }}>
            <Sparkles className="size-3.5" />
            <span>Welcome to EasyHR</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              EasyHR
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto font-medium">
              The beautiful, unified space for attendance check-ins, leave requests, and transparent payroll updates.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
          <Link to="/signin" className="w-full sm:flex-1">
            <Button 
              size="lg" 
              className="w-full h-11 text-xs font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signup" className="w-full sm:flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-11 text-xs font-semibold border-border/80 bg-background/40 hover:bg-accent hover:text-foreground hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-1.5"
            >
              Sign Up
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Directory Section */}
      <div className="w-full max-w-5xl bg-card/35 backdrop-blur-lg border border-border/50 rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="flex items-center gap-2 border-b border-border/40 pb-4">
          <Route className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">App Sandbox Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quick access links to test all layouts (Press <strong className="text-foreground">S</strong> to toggle bypass mode)</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title} className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                <p className="text-[10px] text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-accent hover:border-border transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <Icon className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-primary pr-1 font-semibold">
                        {item.to}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
