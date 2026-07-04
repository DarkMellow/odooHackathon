import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomePage() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-4">
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
      <div className="w-full max-w-lg bg-card/45 backdrop-blur-xl border border-border/50 rounded-[32px] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-primary/5 dark:hover:shadow-primary/10 hover:border-border/80 transition-all duration-500 flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Logo and Brand */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary select-none animate-bounce" style={{ animationDuration: '3s' }}>
            <Sparkles className="size-3.5" />
            <span>Welcome to EasyHR</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              EasyHR
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-sm mx-auto font-medium">
              The beautiful, unified space for attendance check-ins, leave requests, and transparent payroll updates.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3.5 sm:flex-row sm:gap-4 justify-center">
          <Link to="/signin" className="w-full sm:flex-1">
            <Button 
              size="lg" 
              className="w-full h-12 text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 rounded-xl"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signup" className="w-full sm:flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 text-sm font-semibold border-border/80 bg-background/40 hover:bg-accent hover:text-foreground hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-1.5"
            >
              Sign Up
              <ArrowRight className="size-4 group-hover/button:translate-x-0.5 transition-transform duration-200" />
            </Button>
          </Link>
        </div>

        {/* Subtle Footer branding */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 select-none">
          <span>Secure</span>
          <span className="size-1 rounded-full bg-muted-foreground/45" />
          <span>Fast</span>
          <span className="size-1 rounded-full bg-muted-foreground/45" />
          <span>Self-Service</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
