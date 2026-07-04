import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

function LoginForm() {
  const navigate = useNavigate();
  const { login, error, setError, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  // Clear errors when the form unmounts
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset error when user starts typing
    if (fieldErrors[name as "email" | "password"]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const user = await login(formData.email, formData.password);
      if (user.role === "HR") {
        navigate("/admin/employees");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.details) {
        const errors = { email: "", password: "" };
        err.details.forEach((issue: any) => {
          if (issue.field === "email") errors.email = issue.message;
          if (issue.field === "password") errors.password = issue.message;
        });
        setFieldErrors(errors);
      }
    }
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
            Welcome back
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your account.
          </p>
        </div>

        {/* Error message */}
        {error && !error.toLowerCase().includes("validation error") && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={`h-10 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:ring-1 text-foreground disabled:opacity-50 ${
                fieldErrors.email
                  ? "border-destructive focus:border-destructive focus:ring-destructive"
                  : "border-border focus:border-ring focus:ring-ring"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="size-3.5 shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                className={`h-10 w-full rounded-xl border bg-background pl-3.5 pr-10 text-sm outline-none transition focus:ring-1 text-foreground disabled:opacity-50 ${
                  fieldErrors.password
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-ring focus:ring-ring"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="size-3.5 shrink-0" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full h-10 font-semibold mt-2 rounded-xl flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-1.5 font-bold text-foreground hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginForm;