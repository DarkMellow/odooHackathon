import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Premium Minimalist Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-foreground">HRMS</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
