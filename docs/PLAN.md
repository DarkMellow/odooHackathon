# Step-by-Step Project Implementation Plan
## Human Resource Management System (HRMS)

**Document Owner:** Senior Full-Stack Engineer & Project Manager  
**Status:** Approved  
**Last Updated:** July 4, 2026  
**Reference Docs:** [PRD (PRD.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/PRD.md) | [TRD (TRD.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/TRD.md) | [Schema (SCHEMA.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/SCHEMA.md) | [Design (DESIGN.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/DESIGN.md)

---

## Phase 1: Database Initialization & ORM Integration

### 1.1 Goals
Connect the application layer with the MySQL instance, map relational structures, and write database migrations.

### 1.2 Developer Task List
1. **Prisma Setup**:
   - Initialize Prisma under `/server`: run `npx prisma init` in the server root.
   - Configure the environment variables (`DATABASE_URL="mysql://user:pass@host:port/dbname"`) in `/server/.env`.
2. **Schema Integration**:
   - Copy the schema layout specified in [SCHEMA.md](file:///home/aditya/Documents/Projects/odooHackathon/docs/SCHEMA.md) into `/server/prisma/schema.prisma`.
3. **Migration Execution**:
   - Generate local schema migrations: run `npx prisma migrate dev --name init_hrms_schema`.
4. **Prisma Client Client Generation**:
   - Build compiled client structures: run `npx prisma generate`.
5. **Database Seeder**:
   - Create `/server/prisma/seed.ts` containing mock profiles, users, and salary models to bootstrap local development environments. Add one default Admin account (`hr@company.com`) and one default Employee account (`employee@company.com`).

### 1.3 Deliverables
- A running MySQL 8 database reflecting all schema tables.
- Generated Prisma Client typings available under `/server/node_modules/.prisma`.
- Seed script successfully populates local databases with test values.

---

## Phase 2: Authentication & Security Backends

### 2.1 Goals
Build user enrollment endpoints, login mechanisms, HTTP-Only session cookies, and authorization routing barriers.

### 2.2 Developer Task List
1. **Password Hashing Implementation**:
   - Set up standard hashing helpers in `/server/src/utils/crypto.ts` using `bcryptjs` (salt rounds = 12).
2. **JWT Utilities**:
   - Develop token generators in `/server/src/utils/jwt.ts` creating `accessToken` (15m expiry) and `refreshToken` (7d expiry) objects.
3. **Session Controllers**:
   - Create auth router endpoints in `/server/src/routes/auth.routes.ts`:
     - `POST /api/auth/signup`: Accepts fields, hashes password, saves unverified profile, registers verification token in database.
     - `POST /api/auth/login`: Validates inputs, checks verification state, writes cookies, stores active refresh token.
     - `POST /api/auth/logout`: Revokes token in database, deletes browser cookie.
     - `POST /api/auth/refresh`: Resolves token rotation, replacing refresh/access tokens.
4. **Access Control Middleware**:
   - Build token validator (`verifyToken`) and role guard (`requireRole(['EMPLOYEE', 'HR'])`) validation blocks in `/server/src/middleware/auth.middleware.ts`.
5. **Request Parsing Validators**:
   - Construct Zod schema validators matching endpoint requirements under `/server/src/validators/auth.validator.ts`.

### 2.3 Deliverables
- Functional sign-up, sign-in, and log-out endpoints tested via Postman or Curl.
- Active authentication cookie verification protecting API routes.
- Fully typed role checks logging unauthorized requests (`403 Forbidden`).

---

## Phase 3: Core Client Layout & Navigation Shells

### 3.1 Goals
Construct base page skeletons, global layout wrappers (`AppLayout`), routing matrices, and authorization routing wrappers.

### 3.2 Developer Task List
1. **Vite Routing Setup**:
   - Configure React Router DOM v7 maps inside `/client/src/lib/router.tsx`. Add routes for:
     - Public: `/login` (Sign In), `/signup` (Sign Up), `/verify-email` (Success handler).
     - Employee: `/dashboard`, `/profile`, `/attendance`, `/leave`.
     - Admin: `/admin/dashboard`, `/admin/employees`, `/admin/attendance`, `/admin/leave`, `/admin/payroll`.
2. **Route Guard Wrappers**:
   - Develop authentication wrappers (`ProtectedRoute.tsx`) that inspect local Zustands and redirect unauthenticated routes.
3. **Navigation Sidebar / Bottom Nav Layout**:
   - Complete `/client/src/components/app-layout.tsx`. Build a responsive sidebar (desktop) that collapses into a bottom navbar (mobile) matching the styles in [UI.md](file:///home/aditya/Documents/Projects/odooHackathon/docs/UI.md).
4. **Zustand Auth Store**:
   - Construct a global store `/client/src/stores/auth.store.ts` managing user session variables and active status keys.

### 3.3 Deliverables
- Working client routes that restrict page access based on roles.
- Responsive, screen-adaptive layout frames with functional navigation links.

---

## Phase 4: Profile & Attendance Core Modules

### 4.1 Goals
Build read/edit profile pages, daily check-in workflows, and personal/organizational history logs.

### 4.2 Developer Task List
1. **Employee Profile Screens**:
   - Build `/client/src/pages/profile.page.tsx`. Implement multi-tab panels (Personal, Job, Salary, Documents).
   - Write API `GET /api/employee/profile` and `PUT /api/employee/profile` handlers. Ensure only permitted fields (phone, address) are modifiable.
2. **Daily Attendance Widget**:
   - Construct check-in / check-out actions on the client dashboard. Ensure buttons show loading skeleton blocks and trigger immediate screen state updates (Optimistic UI updates).
   - Write `/server/src/routes/attendance.routes.ts` mapping `POST /api/employee/attendance/check-in` and `/check-out` endpoints, enforcing the single check-in rule.
3. **History Views**:
   - Implement daily/weekly calendar grid tracking maps inside `/client/src/pages/attendance.page.tsx` with date paginators.
   - Build backend directories returning aggregated user logs.

### 4.3 Deliverables
- Users can view and modify personal profile cards.
- Interactive widgets log check-ins and update dashboard stats in real-time.
- Daily/weekly attendance logs fetch historical records.

---

## Phase 5: Leave & Payroll Operations

### 5.1 Goals
Deliver visual leave request calendars, admin approval streams, and salary configuration engines.

### 5.2 Developer Task List
1. **Leave Application Form**:
   - Build `/client/src/pages/leave-apply.page.tsx` containing leave type dropdowns, remark text areas, and calendar date range pickers.
   - Design backend validation middleware checking overlapping date records.
2. **Admin Approvals Console**:
   - Build `/client/src/pages/admin/leave-approvals.page.tsx` displaying queue lists of pending employee requests.
   - Code `PUT /api/admin/leave/approvals/:id` allowing status changes. Force validation rules requiring comments on rejections.
3. **Payroll Visibility & Salary Manager**:
   - Construct individual read-only salary structures under profiles.
   - Develop `/client/src/pages/admin/payroll.page.tsx` for Admins to adjust employee wage variables (base, allowances, deductions) using a dynamically listing JSON form.

### 5.3 Deliverables
- Employees can request time-off, avoiding overlapping schedule errors.
- Admins can resolve leave queues with inline feedback comments.
- Salary structures can be adjusted dynamically by HR Officers.

---

## Phase 6: Verification, Emails, & External Integrations

### 6.1 Goals
Integrate transactional mail modules to process verification tasks, new user invitations, and system notifications.

### 6.2 Developer Task List
1. **Mailer Setup**:
   - Initialize transporter configs inside `/server/src/utils/mailer.ts` using NodeMailer (or an external gateway like SendGrid/SES).
2. **Email Verification Dispatcher**:
   - Hook mailers into user creation flows. Signup events trigger dynamic emails containing unique URLs pointing to client confirmation pages.
3. **Verification Landing Screen**:
   - Design `/client/src/pages/verify-email.page.tsx`. Upon load, it triggers verification requests to the API, displaying feedback screens on success/failure.
4. **Invite Flow Integration**:
   - Ensure Admin user additions trigger invite emails prompting new users to complete verification and password configurations.

### 6.3 Deliverables
- Outgoing transactional mail flows verify registrations and deliver admin-created profile invitations.
- Email verification links update user verification states.

---

## Phase 7: Testing Strategy (Automated & Manual)

### 7.1 Goals
Run complete validation tests checking data models, routing access security, and page visual flows.

### 7.2 Developer Task List
1. **Unit Tests (Backend)**:
   - Establish API verification suites using Vitest or Jest. Code tests verifying password validation algorithms, schema limits, and JWT token rotation logic.
2. **Role Security Tests**:
   - Write integration scripts checking that `/api/admin/*` endpoints reject Employee tokens with `403 Forbidden` statuses.
3. **Client E2E Tests**:
   - Program Playwright or Cypress workflows tracking user sign-ins, check-in operations, and leave submissions.
4. **Accessibility (a11y) Audits**:
   - Audit color contrast profiles (Cal.com white-black palettes), keyboard focus states, screen-reader text markings, and tap targets.

### 7.3 Deliverables
- Automated unit and integration test runs check core routes.
- E2E testing sweeps confirm critical login-to-leave user paths.
- Accessibility audits confirm compliance.

---

## Phase 8: Deployment & Infrastructure Setup

### 8.1 Goals
Release production builds of client bundles and server assets into highly available, scalable clouds.

### 8.2 Developer Task List
1. **Vite Build Verification**:
   - Run compilation checks (`pnpm build`) locally to confirm bundle builds output correctly without type warnings.
2. **Dockerization (Server)**:
   - Construct `/server/Dockerfile` utilizing slim Node-Alpine layers. Verify that server ports bind correctly under production environment variables.
3. **Cloud Infrastructure Provisioning**:
   - Set up API runners (Vercel, Render, AWS, or Google Cloud Run).
   - Set up database servers (AWS RDS MySQL or DigitalOcean Managed Databases). Configure VPC restrictions to isolate databases.
4. **CI/CD Build Pipelines**:
   - Establish GitHub Actions pipelines (`/.github/workflows/deploy.yml`) executing static checks and testing scripts on merge requests.

### 8.3 Deliverables
- Automated integration pipelines trigger builds on codebase updates.
- Docker containers run web APIs linked to secure MySQL database services.
- Client bundles serve static assets via global CDNs.

---

## Phase 9: Final Polish & Launch

### 9.1 Goals
Verify system constraints, clean empty states, optimize Largest Contentful Paint (LCP) performance, and go live.

### 9.2 Developer Task List
1. **Empty State Coverage**:
   - Ensure screens (such as empty logs or zero-result searches) render proper callouts matching [FLOW.md](file:///home/aditya/Documents/Projects/odooHackathon/docs/FLOW.md) specs.
2. **Skeleton UI Optimization**:
   - Check skeleton placeholders to verify client views do not experience layout shifts as API responses load.
3. **Performance Optimization (LCP/INP)**:
   - Compress layout image assets, verify font load weights, and enable database query caching.
4. **Production Handover & Walkthrough**:
   - Run a final review of the system, verifying features are fully active.

### 9.3 Deliverables
- Optimized layout, fast page transitions, and smooth load states.
- Clean system logs and zero compile-time console warnings.
- Production release is fully active.
