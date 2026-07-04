import { useState } from "react";

function SignupForm() {
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    password: "",
    role: "Employee",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // TODO:
    // authService.signup(formData);
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
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create your account to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Employee ID */}
          <div>
            <label
              htmlFor="employeeId"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Create Account
          </button>

        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-gray-200"></div>

          <span className="mx-4 text-sm text-gray-400">OR</span>

          <div className="h-px flex-1 bg-gray-200"></div>
        </div>


        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?
          <button
            type="button"
            className="ml-1 font-semibold text-black hover:underline"
          >
            Sign In
          </button>
        </p>

      </div>
    </section>
  );
}

export default SignupForm;