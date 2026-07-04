import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Reset Password Email:", email);

    // TODO:
    // Call your backend API
    // POST /api/auth/forgot-password
  };

  return (
    <section className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-lg font-semibold text-white">
            O
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Forgot Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter your registered email address and we'll send you a password
            reset link.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Send Reset Link
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-gray-200"></div>

          <span className="mx-4 text-sm text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-600">
          Remember your password?
          <Link
            to="/signin"
            className="ml-1 font-semibold text-black hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </section>
  );
}

export default ForgotPasswordForm;