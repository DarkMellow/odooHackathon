# Product Requirements Document (PRD)
## Human Resource Management System (HRMS)
### "Every workday, perfectly aligned."

**Document Owner:** Product Management
**Status:** Draft v1.0
**Last Updated:** July 4, 2026

---

## 1. App Overview

HRMS is a role-based web/mobile application that digitizes core human resource operations for small and mid-sized organizations. It replaces spreadsheets, paper forms, and email threads with a single system of record for employee profiles, attendance, leave, and payroll visibility — with built-in approval workflows for HR and Admin users.

The product has two primary experiences:
- **Employee experience:** self-service profile, attendance, leave requests, and payroll visibility.
- **Admin/HR experience:** organization-wide oversight, approvals, and payroll control.

**Vision statement:** Give every employee a clear, self-service view of their work life, and give every HR team a single dashboard to manage it — without spreadsheets or email chains.

---

## 2. Target Users

| Segment | Description | Key Needs |
|---|---|---|
| **HR Officer / Admin** | Manages employees, approves leave and attendance, controls payroll | Centralized visibility, fast approvals, accurate records, reduced manual work |
| **Employee** | Individual contributor with limited access | Easy self-service for profile, attendance, and leave; transparency on salary and request status |

**Primary buyer/decision-maker:** HR leads or operations managers at small-to-mid-sized companies (roughly 20–500 employees) who currently rely on manual or fragmented tools (spreadsheets, WhatsApp/email, disconnected point solutions).

**Primary daily user:** Employees, who will interact with the app most frequently for check-in/check-out and status checks.

---

## 3. Problem Statement

HR operations at growing companies are commonly fragmented across spreadsheets, email, and verbal approvals. This creates several pain points:

- **For employees:** No single place to check attendance history, leave balance, request status, or salary details — leading to repeated follow-ups with HR.
- **For HR/Admins:** Manual tracking of attendance and leave is error-prone and time-consuming; approvals happen over email/chat with no audit trail; payroll updates are disconnected from attendance and leave data.
- **For the organization:** Lack of a single source of truth increases compliance risk, slows down HR reporting, and creates friction during onboarding and audits.

**Problem statement:** HR teams and employees at small-to-mid-sized organizations lack a unified, self-service system to manage attendance, leave, and payroll visibility — resulting in administrative overhead, delayed approvals, and poor transparency for employees.

---

## 4. Core Features

### 4.1 Authentication & Authorization
- Sign up with Employee ID, email, password, and role (Employee/HR)
- Password strength rules and required email verification
- Sign in with error handling for invalid credentials
- Role-based access control (Admin vs Employee) gating all subsequent features

### 4.2 Dashboards
- **Employee Dashboard:** quick-access cards for Profile, Attendance, Leave Requests, Logout; recent activity/alerts feed
- **Admin/HR Dashboard:** employee directory, attendance records, pending leave approvals, ability to switch between employee views

### 4.3 Employee Profile Management
- View: personal details, job details, salary structure, documents, profile picture
- Edit: employees can update limited fields (address, phone, profile picture); Admins can edit all fields

### 4.4 Attendance Management
- Daily/weekly attendance views
- Check-in / check-out capability for employees
- Status types: Present, Absent, Half-day, Leave
- Employees see only their own records; Admin/HR sees all employee records

### 4.5 Leave & Time-Off Management
- Apply for leave: select type (Paid, Sick, Unpaid), pick date range via calendar, add remarks
- Monthly calendar view showing Present/Absent markers
- Status tracking: Pending, Approved, Rejected
- Admin/HR: view all requests, approve/reject with comments; changes reflect immediately in employee records

### 4.6 Payroll / Salary Management
- Employee view: read-only salary details
- Admin view: view all payroll, update salary structures, ensure payroll accuracy

---

## 5. User Stories

### Authentication
- As a new user, I want to sign up with my employee ID, email, and password so that I can access the system securely.
- As a user, I want to verify my email so that my account is confirmed before I can log in.
- As a returning user, I want to sign in with clear error messages on failure so that I understand why I couldn't log in.

### Dashboard
- As an employee, I want a dashboard with quick-access cards so that I can jump straight to my profile, attendance, or leave requests.
- As an HR officer, I want a dashboard summarizing employee records and pending approvals so that I can act on them efficiently.

### Profile
- As an employee, I want to view my personal, job, and salary details in one place so that I don't need to ask HR.
- As an employee, I want to update my address, phone number, and profile picture so that my information stays current.
- As an Admin, I want to edit any employee's full profile so that I can correct or update HR records.

### Attendance
- As an employee, I want to check in and check out daily so that my attendance is recorded accurately.
- As an employee, I want to view my daily and weekly attendance so that I can track my own record.
- As an HR officer, I want to view attendance for all employees so that I can monitor workforce presence.

### Leave
- As an employee, I want to apply for leave by selecting a type and date range on a calendar so that the process is quick and clear.
- As an employee, I want to see the status of my leave requests (Pending/Approved/Rejected) so that I know where I stand.
- As an HR officer, I want to approve or reject leave requests with comments so that decisions are documented and communicated.

### Payroll
- As an employee, I want to view my salary details (read-only) so that I have transparency into my compensation.
- As an Admin, I want to update salary structures so that payroll stays accurate as roles or compensation change.

---

## 6. MVP Scope

### In Scope for MVP
| Area | MVP Features |
|---|---|
| Auth | Sign up, sign in, email verification, role-based access (Employee/Admin) |
| Dashboard | Employee dashboard (cards + alerts); Admin dashboard (employee list, attendance, approvals) |
| Profile | View profile (all fields); edit limited fields for employees; full edit for Admin |
| Attendance | Check-in/check-out, daily/weekly view, status types, role-based visibility |
| Leave | Apply for leave with calendar date selection, status tracking, Admin approve/reject with comments |
| Payroll | Read-only employee salary view; Admin view + edit of salary structure |

### Out of Scope for MVP (candidates for v2+)
- Payroll processing/disbursement (bank integration, payslip generation)
- Advanced reporting/analytics and exportable HR reports
- Multi-level approval chains (e.g., manager → HR → finance)
- Mobile push notifications
- Document e-signature workflows
- Multi-organization / multi-tenant support
- Shift scheduling and overtime tracking
- Integration with third-party payroll or accounting systems

**MVP goal:** Prove that a single, role-based system can replace manual attendance, leave, and profile tracking for a pilot group of employees and one HR/Admin team, with measurable time savings in approvals and record-keeping.

---

## 7. Success Metrics

| Metric | Target (first 3 months post-launch) |
|---|---|
| **Employee adoption rate** | ≥80% of employees complete sign-up and profile setup |
| **Daily active check-ins** | ≥85% of active employees check in/out daily |
| **Leave approval turnaround time** | Reduce average approval time from days to <24 hours |
| **Attendance record accuracy** | <2% discrepancy vs. manual audit spot-checks |
| **HR admin time saved** | ≥30% reduction in time spent on manual attendance/leave tracking (self-reported survey) |
| **System reliability** | ≥99.5% uptime; login success rate ≥98% |
| **User satisfaction** | ≥4/5 average rating from employee and HR feedback surveys |

---

## 8. Non-Functional Considerations (Reference)

- **Security:** Enforced password policies, email verification, role-based access control
- **Data privacy:** Salary and personal data restricted to authorized roles only
- **Usability:** Calendar-based leave application should require no training
- **Auditability:** Leave approvals/rejections and comments should be logged with timestamps

---

## 9. Open Questions

- Should Employees be able to see attendance/leave data of teammates (e.g., for coverage planning), or is visibility strictly individual?
- Is a manager role needed between Employee and Admin/HR (e.g., team lead approvals) before payroll-related features are built out?
- What is the expected organization size range for initial rollout, and does the data model need to support multiple departments/locations from day one?