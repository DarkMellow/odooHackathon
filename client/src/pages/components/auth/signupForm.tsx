import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

function SignupForm() {
  const { signup, error, setError, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    role: "Employee",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear errors when the form unmounts
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
      isValid = false;
    } else if (formData.employeeId.trim().length < 3) {
      errors.employeeId = "Employee ID must be at least 3 characters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else {
      if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
        isValid = false;
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
        isValid = false;
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Password must contain at least one lowercase letter";
        isValid = false;
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number";
        isValid = false;
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one special character";
        isValid = false;
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const roleMapped = formData.role === "HR" ? "HR" : "EMPLOYEE";
      const signupRes = await signup({
        fullName: formData.fullName,
        employeeId: formData.employeeId,
        email: formData.email,
        password: formData.password,
        role: roleMapped,
      });

      // Log verification URL in developer console for convenient sandbox testing
      const token = signupRes?.verificationToken;
      if (token) {
        const verificationLink = `${window.location.origin}/verify-email?token=${encodeURIComponent(token)}`;
        console.log("Mock verification link (printed for sandbox testing convenience):\n", verificationLink);
      }

      setIsSuccess(true);
    } catch (err: any) {
      if (err.details) {
        const errors: Record<string, string> = {};
        err.details.forEach((issue: any) => {
          errors[issue.field] = issue.message;
        });
        setFieldErrors(errors);
      }
    }
  };

  if (isSuccess) {
    return (
      <section className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md mb-4 flex justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 text-center space-y-4">
          <div className="flex justify-center py-2">
            <CheckCircle2 className="size-14 text-emerald-500 animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verification Sent
          </h1>
          <p className="text-sm text-muted-foreground">
            Account created successfully! We have sent a verification email to <strong className="text-foreground">{formData.email}</strong>.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Please check your inbox (and spam folder) to complete your registration before signing in.
          </p>
          <div className="pt-4">
            <Button asChild className="w-full h-10 rounded-xl font-semibold">
              <Link to="/signin">Proceed to Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
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
            Create Account
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Create your account to continue.
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={`h-10 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:ring-1 text-foreground disabled:opacity-50 ${
                fieldErrors.fullName
                  ? "border-destructive focus:border-destructive focus:ring-destructive"
                  : "border-border focus:border-ring focus:ring-ring"
              }`}
            />
            {fieldErrors.fullName && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="size-3.5 shrink-0" />
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Employee ID */}
          <div>
            <label
              htmlFor="employeeId"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Employee ID
            </label>

            <input
              id="employeeId"
              type="text"
              name="employeeId"
              placeholder="Enter your employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={`h-10 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:ring-1 text-foreground disabled:opacity-50 ${
                fieldErrors.employeeId
                  ? "border-destructive focus:border-destructive focus:ring-destructive"
                  : "border-border focus:border-ring focus:ring-ring"
              }`}
            />
            {fieldErrors.employeeId && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="size-3.5 shrink-0" />
                {fieldErrors.employeeId}
              </p>
            )}
          </div>

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
                placeholder="Create a password"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={isLoading}
                required
                className={`h-10 w-full rounded-xl border bg-background pl-3.5 pr-10 text-sm outline-none transition focus:ring-1 text-foreground disabled:opacity-50 ${
                  fieldErrors.confirmPassword
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-ring focus:ring-ring"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="size-3.5 shrink-0" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Role
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 font-semibold mt-2 rounded-xl flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-border"></div>

          <span className="mx-3 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">OR</span>

          <div className="h-px flex-1 bg-border"></div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?
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

export default SignupForm;