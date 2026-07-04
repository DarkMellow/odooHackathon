# Authentication & Session Verification QA Guidelines

This document serves as a straightforward manual testing guideline for checking the security, functionality, and robustness of the Human Resource Management System (HRMS) authentication flow.

---

## 1. Sign-Up & Registration Testing

### Test Case 1.1: Successful Sign-Up Flow
- **Action**: Fill out the registration form with valid, unused credentials:
  - **Full Name**: `Test User`
  - **Employee ID**: `EMP999` (unique)
  - **Email**: `test.user@company.com` (unique)
  - **Password**: `SecurePass123!` (matches complexity)
  - **Confirm Password**: `SecurePass123!` (matches password exactly)
  - **Role**: `Employee`
- **Expected Result**: 
  - Submitting shows the verification success screen: "Verification Sent - Account created successfully! We have sent a verification email to...".
  - The database records a new user in `users` with `is_verified = false` and creates a corresponding record in `profiles`.
  - A verification token is successfully generated in the `verification_tokens` table.

### Test Case 1.2: Password Show / Hide Toggle
- **Action**: Enter characters in the password and confirm password inputs, and click the eye / eye-off toggle icon inside the input controls.
- **Expected Result**: The characters switch instantly between dot markers (hidden type="password") and plain readable characters (visible type="text").

### Test Case 1.3: Confirm Password Mismatch
- **Action**: Fill out the registration form but enter `SecurePass123!` in Password and `SecurePass999!` in Confirm Password.
- **Expected Result**: The form blocks submission, and a clean local validation message displays directly below the Confirm Password input field: "Passwords do not match".

### Test Case 1.4: Password Strength Enforcement
- **Action**: Attempt sign-up with simple passwords:
  - No capital letter: `password123!`
  - No special character: `Password123`
  - No numbers: `Password!!`
  - Too short (under 8 chars): `P@ss1`
- **Expected Result**: Sign-up fails. Zod validation errors return from the backend, and precise inline error labels display directly below the Password input: "Password must contain at least one uppercase letter", "Password must be at least 8 characters", etc.

### Test Case 1.5: Duplicate Email or Employee ID (Conflict)
- **Action**: Attempt to sign up a second account using an email or Employee ID that is already registered in the system.
- **Expected Result**: Backend returns `409 Conflict`. UI displays error alert banner: "A user with this email or employee ID is already registered."

---

## 2. Email Verification Flow

### Test Case 2.1: Successful Verification
- **Action**: Copy the token generated in the database `verification_tokens` table for the test user. Navigate directly to `http://localhost:5173/verify-email?token=<token>`.
- **Expected Result**: 
  - UI shows "Email Verified!" success card.
  - Clicking "Proceed to Sign In" redirects user to `/signin`.
  - Database updates the user record (`is_verified = true`) and removes the token record from `verification_tokens`.

### Test Case 2.2: Invalid Token Handling
- **Action**: Navigate to `http://localhost:5173/verify-email?token=invalid_dummy_token`.
- **Expected Result**: 
  - UI renders "Verification Failed" error card showing: "Invalid or expired verification token."
  - Button directs user back to signup or login.

### Test Case 2.3: Expired Token Handling
- **Action**: Manually edit the database `verification_tokens` record's `expires_at` timestamp for a token to a date in the past. Navigate to `/verify-email?token=<expired_token>`.
- **Expected Result**: 
  - UI renders "Verification Failed" showing: "Verification token has expired. Please sign up again."
  - The expired token is purged from the database.

---

## 3. Sign-In & Login Flow

### Test Case 3.1: Unverified Email Login Attempt
- **Action**: Try to log in using the credentials of a registered but unverified user.
- **Expected Result**: Login fails. Backend returns `403 Forbidden` and the UI shows: "Your email address is not verified yet. Please check your inbox."

### Test Case 3.2: Incorrect Credentials (Security Safeguards)
- **Action**: Try to log in with an incorrect email or incorrect password.
- **Expected Result**: 
  - Login fails. Backend returns `401 Unauthorized` and the UI shows: "Invalid email or password."
  - The backend runs a delayed password comparison script to prevent username enumeration timing attacks.

### Test Case 3.3: Role-Based Dashboard Redirection
- **Action**:
  - Log in as an Employee (`employee@company.com`).
  - Log in as an HR Admin (`hr@company.com`).
- **Expected Result**:
  - Employees are redirected to `/dashboard`.
  - HR Admins are redirected to `/admin/employees`.
  - Cookies `accessToken` (15m expiry) and `refreshToken` (7d expiry) are successfully written to the browser as `httpOnly`, `Secure`, `SameSite=Strict`.

---

## 4. Protected Routes & Authorization Guards (RBAC)

### Test Case 4.1: Accessing Protected Pages Unauthenticated
- **Action**: Log out of the application. Attempt to access `/dashboard`, `/profile`, `/admin/employees`, or `/admin/attendance` directly via the URL bar.
- **Expected Result**: The browser blocks page rendering and immediately redirects the user to `/signin`.

### Test Case 4.2: Role Guard Bypass Attempt (Employee accessing HR Admin Pages)
- **Action**: Log in as an Employee. Try to navigate to `/admin/employees`, `/admin/attendance`, `/admin/leave`, or `/admin/payroll` directly via the URL.
- **Expected Result**: The `ProtectedRoute` guard intercepts the navigation, detects the `EMPLOYEE` role, blocks rendering, and redirects the user back to the Employee `/dashboard`.

### Test Case 4.3: HR Admin view-toggling
- **Action**: Log in as an HR Admin. Use the bottom sidebar role toggle button: "Switch to Employee view".
- **Expected Result**: The user interface adapts dynamically, displaying the Employee sidebar menu options, and navigates the user to `/dashboard` so they can manage self-service attendance/leaves. Toggling back routes them back to `/admin/employees`.

---

## 5. Session Management & Token Rotation

### Test Case 5.1: Page Refresh Session Persistence
- **Action**: Log in successfully and navigate to `/dashboard`. Refresh the page (`Ctrl + R` / `F5`).
- **Expected Result**: 
  - A pulsing loading screen "Restoring secure session..." briefly displays while calling `/api/employee/profile`.
  - The session is restored successfully and the dashboard remains active without forcing the user to log in again.

### Test Case 5.2: Logout Flow
- **Action**: Click the "Log out" button on the user card.
- **Expected Result**: 
  - The backend revokes the refresh token from the database.
  - The browser cookies `accessToken` and `refreshToken` are cleared.
  - The user is redirected to `/signin`.
  - Trying to navigate back to `/dashboard` redirects to `/signin`.
