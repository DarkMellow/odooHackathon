import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset Password Email:", email);

    // TODO: Call your backend API POST /api/auth/forgot-password
  };

  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Back button container */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8">

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            E
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Forgot Password
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your registered email address and we'll send you a password reset link.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring text-foreground"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-10 font-semibold mt-2 rounded-xl"
          >
            Send Reset Link
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-border"></div>

          <span className="mx-3 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            OR
          </span>

          <div className="h-px flex-1 bg-border"></div>
        </div>

        {/* Back to Login */}
        <p className="text-center text-xs text-muted-foreground">
          Remember your password?
          <Link
            to="/signin"
            className="ml-1.5 font-bold text-foreground hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </section>
  );
}

export default ForgotPasswordForm;