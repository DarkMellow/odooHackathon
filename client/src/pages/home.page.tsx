import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center flex flex-col gap-6 items-center px-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
          Every workday, <span className="text-primary">perfectly aligned.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Digitize your attendance check-ins, request leave instantly, and access real-time payroll transparency — all in a single self-service platform.
        </p>
        <div className="flex gap-4 mt-4">
          <Link to="/login">
            <Button size="lg">Access Dashboard</Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="mt-20 w-full max-w-5xl px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="border bg-card text-card-foreground rounded-lg p-6 flex flex-col gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            ⏱️
          </div>
          <h3 className="font-semibold text-lg mt-2">Attendance Check-in</h3>
          <p className="text-sm text-muted-foreground">
            Simple one-click daily check-in and check-out logs to keep your work records precise.
          </p>
        </div>

        {/* Card 2 */}
        <div className="border bg-card text-card-foreground rounded-lg p-6 flex flex-col gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            📅
          </div>
          <h3 className="font-semibold text-lg mt-2">Leave Management</h3>
          <p className="text-sm text-muted-foreground">
            Request time-off with a visual calendar date picker and track HR approval status in real-time.
          </p>
        </div>

        {/* Card 3 */}
        <div className="border bg-card text-card-foreground rounded-lg p-6 flex flex-col gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            💵
          </div>
          <h3 className="font-semibold text-lg mt-2">Payroll Visibility</h3>
          <p className="text-sm text-muted-foreground">
            View transparent breakdowns of your salary structure and historic pay details securely.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
