# HRMS Application — Complete App Flow Document
### For engineering / AI build agents — every screen, action, and state specified

**Version:** 1.0
**Purpose:** This document specifies every screen, user action, button behavior, navigation path, and system state (success/error/empty/loading) required to build the HRMS MVP without requiring product clarification during implementation. Where a decision was not specified in the source PRD, a default has been chosen and explicitly labeled **[ASSUMPTION]**.

---

## 0. Conventions Used in This Document

- **Screen ID** format: `[ROLE]-[MODULE]-[NUMBER]` e.g. `EMP-AUTH-01`, `ADM-LEAVE-02`
- **Roles:** `EMP` = Employee, `ADM` = Admin/HR Officer, `ALL` = both roles
- Every screen entry includes: **Purpose**, **Entry Points**, **Elements**, **Actions & Button Behavior**, **Navigation**, **Success State**, **Error State(s)**, **Empty State** (where applicable), **Loading State**.
- "Toast" = a temporary non-blocking notification banner (auto-dismiss after 4s).
- "Modal" = a blocking dialog requiring user action to dismiss.
- All destructive or record-changing actions (approve/reject leave, edit salary) require a confirmation step.
- All timestamps are recorded in the system for audit purposes on approval/rejection actions.

---

## 1. Global App Structure

### 1.1 Role-Based Navigation Shells

**Employee Shell — persistent bottom nav (mobile) / sidebar (web):**
1. Home (Dashboard)
2. Attendance
3. Leave
4. Profile
5. Logout (icon, top-right on web; inside Profile menu on mobile)

**Admin/HR Shell — persistent sidebar:**
1. Home (Dashboard)
2. Employees
3. Attendance Records
4. Leave Approvals
5. Payroll
6. Logout

**[ASSUMPTION]** A top app bar is present on all screens showing: app logo (left), current screen title (center on mobile), user avatar + name + logout icon (right).

### 1.2 Global Rules
- Any screen requiring data fetch shows a **loading skeleton** (not a blank screen or spinner-only) for perceived performance.
- Any network failure shows a full-width inline banner: *"Something went wrong. [Retry]"* — never a silent failure.
- Session expiry (token invalid/expired) on any authenticated screen triggers an immediate redirect to `ALL-AUTH-02 (Sign In)` with a toast: *"Your session has expired. Please sign in again."*
- Unauthorized role access (e.g., Employee manually navigating to an Admin URL) redirects to the user's own Dashboard with a toast: *"You don't have access to that page."*

---

## 2. Authentication Flows

### 2.1 `ALL-AUTH-01` — Sign Up Screen

**Purpose:** New user registration.

**Entry Points:** App launch (unauthenticated) → "Create an account" link from Sign In screen.

**Elements:**
- Field: Full Name (text, required)
- Field: Employee ID (text, required, alphanumeric)
- Field: Email (email, required)
- Field: Password (password, required, masked with show/hide toggle)
- Field: Confirm Password (password, required, masked)
- Dropdown/Toggle: Role — "Employee" / "HR" (required)
- Checkbox: "I agree to the Terms & Privacy Policy" (required)
- Primary Button: "Create Account"
- Secondary Link: "Already have an account? Sign In"

**Password Rules (enforced live, shown as a checklist under the field):**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character
- Checklist items turn from gray → green as each rule is satisfied in real time.

**Actions & Button Behavior:**
- "Create Account" button is **disabled** until all required fields are filled, password rules are met, passwords match, and terms checkbox is checked.
- On tap/click with valid input: button shows inline spinner, becomes disabled, text changes to "Creating account…".
- On tap/click with the Employee ID already registered: inline error under Employee ID field: *"This Employee ID is already registered."* — button re-enables, no navigation.
- On tap/click with email already registered: inline error under Email field: *"An account with this email already exists. [Sign In instead]"* (link navigates to `ALL-AUTH-02`).

**Navigation:**
- Success → `ALL-AUTH-03` (Email Verification screen)
- "Already have an account?" → `ALL-AUTH-02` (Sign In)

**Success State:** Account created (unverified) → auto-redirect to `ALL-AUTH-03`, toast: *"Account created! Check your email to verify."*

**Error States:**
| Trigger | Message | Behavior |
|---|---|---|
| Duplicate Employee ID | "This Employee ID is already registered." | Inline, field-level |
| Duplicate email | "An account with this email already exists." | Inline, field-level, with Sign In link |
| Password rules not met | Checklist stays red/gray on unmet items | Button stays disabled |
| Passwords don't match | "Passwords do not match." | Inline under Confirm Password |
| Network/server error | "Something went wrong. Please try again." | Toast, form data preserved |

**Empty State:** N/A (form screen).

**Loading State:** Button spinner as described above; form fields disabled during submission.

---

### 2.2 `ALL-AUTH-02` — Sign In Screen

**Purpose:** Authenticate returning users.

**Entry Points:** App launch (no valid session), session expiry redirect, logout redirect, "Sign In" link from Sign Up.

**Elements:**
- Field: Email (required)
- Field: Password (required, masked with show/hide toggle)
- Link: "Forgot Password?"
- Primary Button: "Sign In"
- Secondary Link: "Don't have an account? Sign Up"

**Actions & Button Behavior:**
- "Sign In" disabled until both fields are non-empty.
- On tap with valid credentials: spinner on button, text → "Signing in…".
- On tap with invalid credentials: both fields outlined red, inline message below Password field: *"Incorrect email or password."* Password field is cleared; Email is retained.
- On tap with unverified email: modal appears: *"Please verify your email before signing in."* with button "Resend Verification Email" → triggers resend and shows toast *"Verification email sent."*
- 5 consecutive failed attempts **[ASSUMPTION]**: field disabled for 60 seconds, message: *"Too many failed attempts. Try again in 60 seconds."*

**Navigation:**
- Success (Employee role) → `EMP-DASH-01`
- Success (Admin/HR role) → `ADM-DASH-01`
- "Forgot Password?" → `ALL-AUTH-04`
- "Sign Up" → `ALL-AUTH-01`

**Success State:** Redirect to role-based dashboard; toast: *"Welcome back, [First Name]."*

**Error States:**
| Trigger | Message |
|---|---|
| Wrong email/password | "Incorrect email or password." |
| Unverified account | Modal: "Please verify your email before signing in." |
| Too many attempts | "Too many failed attempts. Try again in 60 seconds." |
| Network error | Toast: "Something went wrong. Please try again." |

**Empty State:** N/A.

**Loading State:** Button spinner; fields disabled during request.

---

### 2.3 `ALL-AUTH-03` — Email Verification Pending Screen

**Purpose:** Inform the user to verify their email before accessing the app.

**Entry Points:** Post-sign-up redirect.

**Elements:**
- Icon: envelope/mail illustration
- Text: "We've sent a verification link to **[email]**. Please check your inbox."
- Button: "Resend Email" (secondary)
- Link: "Back to Sign In"

**Actions & Button Behavior:**
- "Resend Email": disabled for 30 seconds after each tap (countdown shown: "Resend in 28s"), to prevent spam.
- On tap (enabled): sends new verification email, toast: *"Verification email resent."*
- Verification is completed via link click in the external email client, which opens `ALL-AUTH-05` (Verification Success) in-browser, then the user returns to sign in.

**Navigation:**
- "Back to Sign In" → `ALL-AUTH-02`

**Success State:** N/A on this screen directly (confirmation happens on `ALL-AUTH-05`).

**Error States:**
| Trigger | Message |
|---|---|
| Resend fails (network) | Toast: "Couldn't resend email. Try again." |
| Resend spam-limited | Button disabled with countdown, no error, just disabled state |

**Empty State:** N/A.

---

### 2.4 `ALL-AUTH-04` — Forgot Password Screen

**[ASSUMPTION — not explicitly listed in source requirements but required for a functioning auth flow; flagged for PM confirmation.]**

**Purpose:** Allow users to reset a forgotten password.

**Elements:**
- Field: Email (required)
- Primary Button: "Send Reset Link"
- Link: "Back to Sign In"

**Actions & Button Behavior:**
- On submit with a registered email: success screen shown regardless of whether email exists (security best practice — prevents email enumeration): *"If an account exists for this email, a reset link has been sent."*

**Navigation:** "Back to Sign In" → `ALL-AUTH-02`

**Error States:**
| Trigger | Message |
|---|---|
| Empty field | "Please enter your email." |
| Network error | Toast: "Something went wrong. Please try again." |

---

## 3. Employee Flows

### 3.1 `EMP-DASH-01` — Employee Dashboard (Home)

**Purpose:** Central hub for daily employee actions.

**Entry Points:** Post sign-in, tapping "Home" in nav from anywhere.

**Elements:**
- Greeting header: "Good morning, [First Name]" (time-based greeting) **[ASSUMPTION]**
- Quick-access cards (tappable), each showing an icon + label + 1-line status:
  - **Profile** card
  - **Attendance** card — shows today's status (e.g., "Not checked in" / "Checked in at 9:02 AM")
  - **Leave Requests** card — shows count of pending requests (e.g., "1 pending")
  - **Logout** (icon button, not a full card, top-right)
- Section: "Recent Activity / Alerts" — reverse-chronological list (e.g., "Your leave request for Jul 10 was approved", "You were marked absent on Jul 2")
- Primary CTA button (floating or inline): "Check In" / "Check Out" (toggles based on current attendance state for today)

**Actions & Button Behavior:**
- Tapping "Profile" card → `EMP-PROF-01`
- Tapping "Attendance" card → `EMP-ATT-01`
- Tapping "Leave Requests" card → `EMP-LEAVE-01`
- Tapping "Logout" → confirmation modal: *"Are you sure you want to log out?"* [Cancel] [Log Out] → on confirm, clears session → `ALL-AUTH-02`
- Tapping "Check In" (when not yet checked in today): records timestamp, button changes to "Check Out", toast: *"Checked in at [time]."*
- Tapping "Check Out" (when checked in): confirmation modal *"Check out now?"* → on confirm, records timestamp, button becomes disabled/grayed with label "Checked out at [time]", toast: *"Checked out at [time]."*

**Navigation:** See above; nav bar always available.

**Success State:** Cards populated with live data; activity feed populated.

**Error States:**
| Trigger | Message |
|---|---|
| Dashboard data fails to load | Inline banner: "Couldn't load your dashboard. [Retry]" |
| Check-in/out fails (network) | Toast: "Couldn't record check-in. Please try again." — button reverts to prior state |
| Double check-in attempt (already checked in) | Button is disabled/hidden; not reachable, so no error needed |

**Empty State:** "Recent Activity" section, if no activity: illustration + text *"No recent activity yet. It'll show up here."*

**Loading State:** Skeleton cards (gray placeholder blocks) while dashboard data loads.

---

### 3.2 `EMP-PROF-01` — View Profile Screen

**Purpose:** Display the employee's full profile.

**Entry Points:** Dashboard "Profile" card, nav bar "Profile" tab.

**Elements:**
- Profile picture (circular, with camera icon overlay if editable)
- Sections (accordion or tabbed): Personal Details, Job Details, Salary Structure, Documents
  - **Personal Details:** Name, DOB, Address, Phone, Email, Emergency Contact
  - **Job Details:** Employee ID, Department, Designation, Date of Joining, Reporting Manager
  - **Salary Structure:** Base salary, allowances, deductions, net pay (read-only)
  - **Documents:** list of uploaded documents (e.g., ID proof, offer letter) with view/download icons
- Button: "Edit Profile" (pencil icon, top-right)

**Actions & Button Behavior:**
- Tapping "Edit Profile" → `EMP-PROF-02`
- Tapping a document row → opens document preview (modal or new tab) or downloads file
- Tapping profile picture → enlarged view modal

**Navigation:** "Edit Profile" → `EMP-PROF-02`

**Success State:** All sections populated.

**Error States:**
| Trigger | Message |
|---|---|
| Profile fails to load | Inline banner: "Couldn't load your profile. [Retry]" |
| Document fails to open | Toast: "Couldn't open this document." |

**Empty State:**
- No documents uploaded: *"No documents on file yet."*
- Missing optional field (e.g., emergency contact not set): shows "—" or *"Not provided"* instead of blank space.

**Loading State:** Skeleton for avatar + text blocks.

---

### 3.3 `EMP-PROF-02` — Edit Profile Screen

**Purpose:** Allow employees to edit permitted fields.

**Entry Points:** "Edit Profile" button on `EMP-PROF-01`.

**Elements:**
- Editable fields: Address, Phone Number, Profile Picture (upload/replace)
- Read-only fields (grayed out, not tappable): Name, DOB, Email, Employee ID, Job Details, Salary — with a small lock icon and tooltip: *"Contact HR to update this field."*
- Button: "Upload New Photo" (opens file picker / camera on mobile)
- Primary Button: "Save Changes"
- Secondary Button: "Cancel"

**Actions & Button Behavior:**
- "Save Changes" disabled until at least one field is changed.
- On save with valid data: spinner on button → success.
- On save with invalid phone format: inline error: *"Please enter a valid phone number."*
- "Cancel": if changes were made, confirmation modal *"Discard unsaved changes?"* [Keep Editing] [Discard] → Discard returns to `EMP-PROF-01` without saving.
- Photo upload: validates file type (jpg/png) and size (<5MB) **[ASSUMPTION]**; oversized/invalid file shows inline error: *"Please upload a JPG or PNG under 5MB."*

**Navigation:**
- Save success → `EMP-PROF-01` with toast: *"Profile updated successfully."*
- Cancel/Discard → `EMP-PROF-01`

**Error States:**
| Trigger | Message |
|---|---|
| Invalid phone format | "Please enter a valid phone number." |
| Invalid photo file | "Please upload a JPG or PNG under 5MB." |
| Save fails (network) | Toast: "Couldn't save changes. Please try again." — stays on screen, data retained |

**Empty State:** N/A (pre-filled form).

**Loading State:** Button spinner during save; image upload shows progress bar/percentage.

---

### 3.4 `EMP-ATT-01` — Attendance View Screen

**Purpose:** Employee views their own attendance history.

**Entry Points:** Dashboard "Attendance" card, nav bar "Attendance" tab.

**Elements:**
- Toggle: "Daily" / "Weekly" view
- **Daily view:** Today's date, check-in time, check-out time, status badge (Present/Absent/Half-day/Leave, color-coded: green/red/yellow/blue)
- **Weekly view:** 7-day row/grid, each day showing a colored status badge; tapping a day expands check-in/out times
- Date navigation: "< Previous Week" / "Next Week >" arrows (Next disabled if current week)
- Check-In / Check-Out button (same behavior as on Dashboard, mirrored here for convenience) **[ASSUMPTION]**

**Actions & Button Behavior:**
- Toggle Daily/Weekly: switches view instantly, no reload.
- Tapping a past day in weekly view: expands a detail row (check-in/out time) inline; does not navigate away.
- "Previous Week" / "Next Week": fetches and re-renders the grid; loading skeleton shown briefly.

**Navigation:** Stays on this screen; nav bar for exiting.

**Success State:** Grid/daily view populated with accurate statuses.

**Error States:**
| Trigger | Message |
|---|---|
| Data fails to load | Inline banner: "Couldn't load attendance data. [Retry]" |
| Check-in/out fails | Toast: "Couldn't record check-in. Please try again." |

**Empty State:** New employee with no attendance history: *"No attendance records yet. Your history will appear here after your first check-in."*

**Loading State:** Skeleton grid/rows while fetching.

---

### 3.5 `EMP-LEAVE-01` — Leave Requests List Screen

**Purpose:** Employee views all their leave requests and statuses.

**Entry Points:** Dashboard "Leave Requests" card, nav bar "Leave" tab.

**Elements:**
- Button: "+ Apply for Leave" (primary, top-right or floating)
- List of leave requests (most recent first), each row showing: Leave type, date range, status badge (Pending = yellow, Approved = green, Rejected = red), submitted date
- Tapping a row expands/opens detail: remarks, HR comments (if any), decision date

**Actions & Button Behavior:**
- "+ Apply for Leave" → `EMP-LEAVE-02`
- Tapping a row → `EMP-LEAVE-03` (detail view) or inline expand **[ASSUMPTION: separate detail screen for clarity]**

**Navigation:**
- "+ Apply for Leave" → `EMP-LEAVE-02`
- Row tap → `EMP-LEAVE-03`

**Success State:** List populated, sorted by most recent submission.

**Error States:**
| Trigger | Message |
|---|---|
| List fails to load | Inline banner: "Couldn't load leave requests. [Retry]" |

**Empty State:** No requests yet: illustration + text *"You haven't applied for any leave yet."* + prominent "+ Apply for Leave" button.

**Loading State:** Skeleton list rows.

---

### 3.6 `EMP-LEAVE-02` — Apply for Leave Screen

**Purpose:** Submit a new leave request.

**Entry Points:** "+ Apply for Leave" button on `EMP-LEAVE-01` or Dashboard.

**Elements:**
- Dropdown/Segmented control: Leave Type — Paid / Sick / Unpaid (required)
- Calendar widget: select start date and end date by tapping directly on the calendar (range selection); calendar shows existing attendance markers (Present/Absent) for context
- Auto-calculated field: "Total days requested" (read-only, computed from range, excluding weekends **[ASSUMPTION]**)
- Field: Remarks (textarea, optional, character limit 250)
- Primary Button: "Submit Request"
- Secondary Button: "Cancel"

**Actions & Button Behavior:**
- "Submit Request" disabled until Leave Type and both dates are selected.
- Selecting a start date, then an end date before it: auto-swaps so start < end, no error shown **[ASSUMPTION]**.
- Selecting a date range that overlaps an existing Pending/Approved leave request: inline warning banner: *"This overlaps with an existing leave request ([dates]). You can still submit, but it may be rejected."* — does not block submission.
- On submit success: spinner → confirmation.
- Cancel: if fields have been touched, confirmation modal *"Discard this leave request?"* [Keep Editing] [Discard].

**Navigation:**
- Submit success → `EMP-LEAVE-01` with toast: *"Leave request submitted. You'll be notified once it's reviewed."*
- Cancel/Discard → `EMP-LEAVE-01`

**Error States:**
| Trigger | Message |
|---|---|
| Missing leave type or dates | Submit button stays disabled |
| Remarks exceeds 250 chars | Inline counter turns red: "250/250 — limit reached" |
| Submission fails (network) | Toast: "Couldn't submit your request. Please try again." — form data retained |

**Empty State:** N/A (form).

**Loading State:** Button spinner during submission; calendar shows loading skeleton if attendance markers are still fetching.

---

### 3.7 `EMP-LEAVE-03` — Leave Request Detail Screen

**Purpose:** View full detail of a single leave request.

**Entry Points:** Row tap from `EMP-LEAVE-01`.

**Elements:**
- Leave type, date range, total days, remarks (as submitted)
- Status badge (Pending/Approved/Rejected)
- If reviewed: reviewer name, decision date, HR comments
- Button: "Withdraw Request" (only visible/enabled if status = Pending) **[ASSUMPTION]**

**Actions & Button Behavior:**
- "Withdraw Request": confirmation modal *"Withdraw this leave request?"* [Cancel] [Withdraw] → on confirm, status changes to "Withdrawn" (or request is removed — **[ASSUMPTION: status changed to "Withdrawn" for audit trail]**), toast: *"Leave request withdrawn."*

**Navigation:** Back arrow → `EMP-LEAVE-01`

**Error States:**
| Trigger | Message |
|---|---|
| Withdraw fails | Toast: "Couldn't withdraw request. Please try again." |
| Detail fails to load | Inline banner: "Couldn't load this request. [Retry]" |

---

### 3.8 `EMP-PAY-01` — Payroll View Screen (Read-Only)

**Purpose:** Employee views salary details.

**Entry Points:** Profile → Salary Structure section "View Full Details" link, or dedicated nav entry **[ASSUMPTION: accessible via Profile since no separate nav tab was specified in requirements]**.

**Elements:**
- Current salary structure: base pay, allowances (itemized), deductions (itemized), net pay
- Effective date of current structure
- Historical view toggle (if salary changed over time) **[ASSUMPTION]**
- Watermark/label: "Read-only — contact HR for changes"

**Actions & Button Behavior:** No editable elements; purely informational. No buttons except back navigation.

**Navigation:** Back arrow → `EMP-PROF-01`

**Error States:**
| Trigger | Message |
|---|---|
| Data fails to load | Inline banner: "Couldn't load payroll data. [Retry]" |

**Empty State:** Salary structure not yet set by HR: *"Your salary details haven't been set up yet. Contact HR."*

---

## 4. Admin / HR Flows

### 4.1 `ADM-DASH-01` — Admin Dashboard (Home)

**Purpose:** Central hub for HR/Admin oversight.

**Entry Points:** Post sign-in (Admin/HR role).

**Elements:**
- Summary cards: Total Employees, Present Today, On Leave Today, Pending Leave Approvals (count badge)
- Section: "Employee List" (searchable/filterable table — name, department, status)
- Section: "Recent Attendance" snapshot (today's check-ins)
- Section: "Pending Leave Approvals" snapshot (top 3-5, with "View All" link)

**Actions & Button Behavior:**
- Tapping "Pending Leave Approvals" card/count → `ADM-LEAVE-01`
- Tapping an employee row in Employee List → `ADM-EMP-02` (that employee's detail, i.e. "switch to employee view")
- Search bar: filters Employee List live as user types
- "View All" on Recent Attendance → `ADM-ATT-01`

**Navigation:** As above; sidebar always available.

**Success State:** All summary cards and lists populated with current data.

**Error States:**
| Trigger | Message |
|---|---|
| Dashboard fails to load | Inline banner: "Couldn't load dashboard data. [Retry]" |
| Search returns no matches | Inline text under search: "No employees match '[query]'." |

**Empty State:** No pending approvals: *"No pending leave requests. You're all caught up."*

**Loading State:** Skeleton cards + table rows.

---

### 4.2 `ADM-EMP-01` — Employee List Screen

**Purpose:** Full directory of employees with management actions.

**Entry Points:** Sidebar "Employees" tab.

**Elements:**
- Search bar (by name/employee ID)
- Filter dropdowns: Department, Status (Active/Inactive) **[ASSUMPTION]**
- Table/list columns: Photo, Name, Employee ID, Department, Designation, Status, "View" action
- Button: "+ Add Employee" (top-right) **[ASSUMPTION — implied by Admin's ability to manage employees, though not explicitly detailed in source requirements]**

**Actions & Button Behavior:**
- Tapping a row / "View" → `ADM-EMP-02`
- "+ Add Employee" → `ADM-EMP-03`
- Search/filter: live-updates list, no page reload

**Navigation:** As above.

**Success State:** List populated and filterable.

**Error States:**
| Trigger | Message |
|---|---|
| List fails to load | Inline banner: "Couldn't load employee list. [Retry]" |
| Search/filter returns nothing | "No employees found matching your filters." |

**Empty State:** No employees in system yet (new org): illustration + *"No employees added yet."* + "+ Add Employee" CTA.

**Loading State:** Skeleton table rows.

---

### 4.3 `ADM-EMP-02` — Employee Detail / Full Profile Edit Screen

**Purpose:** Admin views and edits any employee's complete profile.

**Entry Points:** Row tap from `ADM-EMP-01` or `ADM-DASH-01`.

**Elements:**
- Same sections as `EMP-PROF-01` (Personal, Job, Salary, Documents) but **all fields editable** by Admin
- Tabs/links to jump to that employee's Attendance (`ADM-ATT-02`) and Leave history (`ADM-LEAVE-03`) directly
- Button: "Edit" (pencil, top-right) toggles fields into editable inputs
- Button: "Save Changes" / "Cancel" (appear once in edit mode)
- Button: "Deactivate Employee" (destructive, bottom of screen) **[ASSUMPTION]**

**Actions & Button Behavior:**
- "Edit" → all fields become editable inline (no separate screen, unlike employee's own edit flow, since Admin edits everything)
- "Save Changes": validates required fields (e.g., email format, valid dates); on success, fields lock back to read-only, toast: *"Employee profile updated."*
- "Deactivate Employee": confirmation modal *"Deactivate [Name]? They will lose access to the system."* [Cancel] [Deactivate] → on confirm, employee status set to Inactive, toast: *"[Name] has been deactivated."*

**Navigation:**
- Back arrow → `ADM-EMP-01`
- "View Attendance" link → `ADM-ATT-02`
- "View Leave History" link → `ADM-LEAVE-03`

**Error States:**
| Trigger | Message |
|---|---|
| Invalid field on save | Inline error under specific field (e.g., "Invalid email format.") |
| Save fails (network) | Toast: "Couldn't save changes. Please try again." |
| Deactivation fails | Toast: "Couldn't deactivate employee. Please try again." |

**Empty State:** Missing document/field: shows "Not provided" / "No documents uploaded."

---

### 4.4 `ADM-EMP-03` — Add Employee Screen

**[ASSUMPTION — implied by Admin management capability; not explicitly detailed in source requirements, flagged for PM confirmation.]**

**Purpose:** Admin manually creates a new employee record.

**Elements:**
- Fields: Name, Employee ID, Email, Department, Designation, Date of Joining, Initial Role (Employee/HR)
- Primary Button: "Create Employee"
- Secondary Button: "Cancel"

**Actions & Button Behavior:**
- On create: system sends an invite email to the employee to set their own password and complete verification (reuses `ALL-AUTH-03` flow).
- Duplicate Employee ID/email: inline error, same pattern as `ALL-AUTH-01`.

**Navigation:** Success → `ADM-EMP-01` with toast: *"Employee added. An invite has been sent to [email]."*

**Error States:** Same duplicate/validation patterns as Sign Up screen.

---

### 4.5 `ADM-ATT-01` — Attendance Records Overview (All Employees)

**Purpose:** Admin views attendance across the organization.

**Entry Points:** Sidebar "Attendance Records", Dashboard "View All" link.

**Elements:**
- Date picker (single day) or date range picker
- Table: Employee Name, Status (Present/Absent/Half-day/Leave), Check-in time, Check-out time
- Filter: Department, Status
- Export button: "Export CSV" **[ASSUMPTION]**

**Actions & Button Behavior:**
- Changing date/range: table re-fetches and re-renders
- "Export CSV": triggers file download, toast: *"Attendance report downloaded."*
- Tapping an employee row → `ADM-ATT-02` (that employee's individual attendance detail)

**Navigation:** Row tap → `ADM-ATT-02`

**Error States:**
| Trigger | Message |
|---|---|
| Data fails to load | Inline banner: "Couldn't load attendance records. [Retry]" |
| Export fails | Toast: "Couldn't export report. Please try again." |

**Empty State:** No records for selected date/filters: *"No attendance records for this selection."*

**Loading State:** Skeleton table.

---

### 4.6 `ADM-ATT-02` — Individual Employee Attendance Detail (Admin view)

**Purpose:** Admin views one employee's attendance history in detail.

**Entry Points:** Row tap from `ADM-ATT-01` or link from `ADM-EMP-02`.

**Elements:** Same daily/weekly view as `EMP-ATT-01`, plus employee name/photo header. Read-only for Admin (no check-in/out button — Admin does not check in on behalf of employees) **[ASSUMPTION]**.

**Navigation:** Back arrow → previous screen (`ADM-ATT-01` or `ADM-EMP-02`).

**Error/Empty States:** Same pattern as `EMP-ATT-01`.

---

### 4.7 `ADM-LEAVE-01` — Leave Approvals List Screen

**Purpose:** Admin reviews and acts on all leave requests.

**Entry Points:** Sidebar "Leave Approvals", Dashboard pending-approvals card.

**Elements:**
- Tabs/Filter: All / Pending / Approved / Rejected (default: Pending)
- List: Employee name, leave type, date range, total days, submitted date, status badge
- Bulk action checkboxes + "Approve Selected" / "Reject Selected" buttons **[ASSUMPTION]**

**Actions & Button Behavior:**
- Tapping a row → `ADM-LEAVE-02` (detail + decision screen)
- Bulk approve/reject: confirmation modal listing affected employees → on confirm, all update, toast: *"[N] requests approved."*

**Navigation:** Row tap → `ADM-LEAVE-02`

**Error States:**
| Trigger | Message |
|---|---|
| List fails to load | Inline banner: "Couldn't load leave requests. [Retry]" |
| Bulk action fails | Toast: "Couldn't process selected requests. Please try again." |

**Empty State:** No requests in selected tab: *"No [pending/approved/rejected] leave requests."*

**Loading State:** Skeleton list.

---

### 4.8 `ADM-LEAVE-02` — Leave Request Review Screen

**Purpose:** Admin approves or rejects a specific leave request.

**Entry Points:** Row tap from `ADM-LEAVE-01`.

**Elements:**
- Full request detail: employee name/photo, leave type, date range, total days, employee remarks
- Employee's attendance context: mini calendar showing surrounding attendance **[ASSUMPTION — helps Admin make informed decision]**
- Field: HR Comments (textarea, optional for approve, **required for reject**)
- Primary Button: "Approve"
- Secondary Button: "Reject" (destructive style — red outline)

**Actions & Button Behavior:**
- "Approve": confirmation modal *"Approve this leave request?"* [Cancel] [Confirm] → on confirm, status → Approved, employee's attendance calendar auto-updates for those dates (marked "Leave"), toast: *"Leave request approved."*
- "Reject": if HR Comments field is empty, inline error: *"Please add a comment explaining the rejection."* — blocks submission. If filled, confirmation modal *"Reject this leave request?"* → on confirm, status → Rejected, toast: *"Leave request rejected."*
- Changes reflect immediately in the employee's `EMP-LEAVE-01`/`EMP-LEAVE-03` and `EMP-ATT-01` views (real-time or next-refresh, per backend capability).

**Navigation:** Success (either action) → `ADM-LEAVE-01` with the request moved out of the Pending tab.

**Error States:**
| Trigger | Message |
|---|---|
| Reject without comment | "Please add a comment explaining the rejection." |
| Action fails (network) | Toast: "Couldn't process this request. Please try again." — request remains Pending |
| Request already actioned by another admin (race condition) **[ASSUMPTION]** | Banner: "This request was already [approved/rejected] by [Admin Name]." — buttons disabled |

---

### 4.9 `ADM-LEAVE-03` — Employee Leave History (Admin view)

**Purpose:** Admin views one employee's full leave history.

**Entry Points:** Link from `ADM-EMP-02`.

**Elements:** Same list structure as `EMP-LEAVE-01`, filtered to one employee, with employee name/photo header. Rows link to `ADM-LEAVE-02` for Pending items, or a read-only detail for already-decided items.

**Error/Empty States:** Same pattern as `EMP-LEAVE-01`.

---

### 4.10 `ADM-PAY-01` — Payroll Overview Screen

**Purpose:** Admin views and manages payroll for all employees.

**Entry Points:** Sidebar "Payroll".

**Elements:**
- Table: Employee Name, Department, Base Salary, Net Pay, Last Updated
- Search/filter by department
- Tapping a row → `ADM-PAY-02`

**Error/Loading/Empty States:** Same patterns as `ADM-ATT-01` (table-based screen).

---

### 4.11 `ADM-PAY-02` — Edit Employee Salary Structure Screen

**Purpose:** Admin updates an individual employee's salary structure.

**Entry Points:** Row tap from `ADM-PAY-01`.

**Elements:**
- Editable fields: Base Salary, itemized Allowances (add/remove line items), itemized Deductions (add/remove line items)
- Auto-calculated: Net Pay (read-only, recalculates live as fields change)
- Field: Effective Date (date picker, required)
- Primary Button: "Save Salary Structure"
- Secondary Button: "Cancel"

**Actions & Button Behavior:**
- "Save": validates all numeric fields are non-negative; confirmation modal *"Update salary structure for [Name], effective [date]?"* [Cancel] [Confirm] → on confirm, saves, toast: *"Salary structure updated for [Name]."*
- Adding/removing allowance/deduction line items: dynamic form rows with a "+ Add Line" and per-row "Remove" (trash icon) button.
- "Cancel": if changes made, confirmation modal *"Discard unsaved changes?"*

**Navigation:** Save success → `ADM-PAY-01`

**Error States:**
| Trigger | Message |
|---|---|
| Negative or non-numeric value | Inline error: "Please enter a valid amount." |
| Missing effective date | Inline error: "Please select an effective date." |
| Save fails (network) | Toast: "Couldn't save salary changes. Please try again." |

**Empty State:** No allowances/deductions yet: shows only Base Salary row with "+ Add Line" prompt.

---

## 5. Cross-Cutting States Reference (Applies to All Screens Unless Overridden Above)

| State Type | Default Behavior |
|---|---|
| **Loading** | Skeleton UI matching the shape of the content being loaded (never a blank white screen) |
| **Network error** | Inline banner with "Retry" button; toasts for action failures (not full-page blocks unless it's the initial page load) |
| **Empty data** | Icon/illustration + one-line explanatory text + a relevant CTA where applicable |
| **Session expiry** | Immediate redirect to `ALL-AUTH-02` with explanatory toast |
| **Unauthorized access** | Redirect to own role's dashboard with explanatory toast |
| **Form validation** | Inline, field-level errors; primary action button disabled until required fields are valid |
| **Destructive/state-changing actions** | Always require a confirmation modal before executing (logout, withdraw leave, deactivate employee, reject leave, approve leave, salary changes) |
| **Success feedback** | Toast notification (4s auto-dismiss) for background actions; full navigation + toast for primary flows (e.g., submit leave, save profile) |

---

## 6. Screen Inventory Summary Table

| Screen ID | Screen Name | Role |
|---|---|---|
| ALL-AUTH-01 | Sign Up | All |
| ALL-AUTH-02 | Sign In | All |
| ALL-AUTH-03 | Email Verification Pending | All |
| ALL-AUTH-04 | Forgot Password | All |
| ALL-AUTH-05 | Verification Success (external link landing) | All |
| EMP-DASH-01 | Employee Dashboard | Employee |
| EMP-PROF-01 | View Profile | Employee |
| EMP-PROF-02 | Edit Profile | Employee |
| EMP-ATT-01 | Attendance View | Employee |
| EMP-LEAVE-01 | Leave Requests List | Employee |
| EMP-LEAVE-02 | Apply for Leave | Employee |
| EMP-LEAVE-03 | Leave Request Detail | Employee |
| EMP-PAY-01 | Payroll View (Read-Only) | Employee |
| ADM-DASH-01 | Admin Dashboard | Admin/HR |
| ADM-EMP-01 | Employee List | Admin/HR |
| ADM-EMP-02 | Employee Detail / Edit | Admin/HR |
| ADM-EMP-03 | Add Employee | Admin/HR |
| ADM-ATT-01 | Attendance Records Overview | Admin/HR |
| ADM-ATT-02 | Individual Attendance Detail | Admin/HR |
| ADM-LEAVE-01 | Leave Approvals List | Admin/HR |
| ADM-LEAVE-02 | Leave Request Review | Admin/HR |
| ADM-LEAVE-03 | Employee Leave History | Admin/HR |
| ADM-PAY-01 | Payroll Overview | Admin/HR |
| ADM-PAY-02 | Edit Salary Structure | Admin/HR |

**Total: 24 screens** across authentication, employee self-service, and admin/HR management.

---

## 7. Items Flagged for Product Confirmation

The following were added as reasonable defaults to make the flow buildable, but should be confirmed with the PM/stakeholder before final build:

1. Forgot Password flow (`ALL-AUTH-04`) — not in original requirements.
2. "Add Employee" and "Deactivate Employee" flows — implied by Admin's management role but not detailed.
3. Bulk approve/reject for leave requests.
4. Withdraw leave request capability for employees.
5. CSV export for attendance records.
6. Whether Admin can check in/out on behalf of an employee (currently: no).
7. Historical salary structure view for employees.
8. Manager/approval-chain role (currently: flat Employee → Admin/HR structure only, per source requirements).