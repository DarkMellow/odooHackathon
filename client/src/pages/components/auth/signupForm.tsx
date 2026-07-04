import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function SignupForm() {
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    password: "",
    role: "Employee",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    // TODO: authService.signup(formData);
  };

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

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
              required
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring text-foreground"
            />
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
              required
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring text-foreground"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring text-foreground"
            />
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
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-10 font-semibold mt-2 rounded-xl"
          >
            Create Account
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