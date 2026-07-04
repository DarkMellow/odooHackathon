import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, error, setError } = useAuthStore();
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  React.useEffect(() => {
    // Clear previous auth errors
    setError(null);

    if (!token) {
      setStatus("error");
      return;
    }

    const runVerification = async () => {
      setStatus("loading");
      try {
        await verifyEmail(token);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };

    runVerification();
  }, [token, verifyEmail, setError]);

  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      {/* Home Navigation */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 text-center">
        {/* Logo Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            E
          </div>
        </div>

        {/* Dynamic Card Body based on Status */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Verifying email</h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Please wait while we confirm your email address and secure your account.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <CheckCircle2 className="size-14 text-emerald-500 animate-bounce" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Your account has been successfully verified. You can now sign in to your employee portal dashboard.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full rounded-xl">
                <Link to="/signin" className="inline-flex items-center justify-center gap-1.5">
                  Proceed to Sign In
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <AlertCircle className="size-14 text-destructive animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Verification Failed
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {error || "The email verification link is invalid, broken, or has expired."}
            </p>
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full rounded-xl">
                <Link to="/signup">Try Registering Again</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full rounded-xl">
                <Link to="/signin">Back to Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default VerifyEmailPage;
