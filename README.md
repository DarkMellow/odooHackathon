# Human Resource Management System (HRMS)

> **Odoo x Hackathon @ Adamas University 2026**  
> *"Every workday, perfectly aligned."*

HRMS is a full-stack, role-based web application designed to digitize core human resource operations for small and mid-sized organizations. It replaces fragmented spreadsheets and email approvals with a single, type-safe system of record for employee profiles, attendance logs, leave requests, and salary structures.

---

### Team Members

* **Ankan** ([@DarkMellow](https://github.com/DarkMellow))
* **Aditya** ([@Aditya81018](https://github.com/Aditya81018))
* **Ayan** ([@skayaanalam78-glitch](https://github.com/skayaanalam78-glitch))

---

## 🚀 Key Features

### 1. Dual Role-Based User Experiences
* **Employee Experience (Self-Service)**:
  * **Interactive Dashboard**: Greeting panel with today's attendance status, check-in/out action buttons, leave stats, quick action cards, and a chronological activity timeline.
  * **Profile Management**: View detailed tabs (Resume, Private Info, Salary). Employees can edit Resume fields (About, Skills tags, Certifications) and Private details (DOB, Nationality, Gender, Marital Status, Phone, Address, Emergency Contact, Bank Details) while keeping their Salary structures read-only.
  * **Leave Application Center**: Monitor remaining Paid/Sick leave quotas, view past leave request statuses and HR comments, withdraw pending requests, and submit new leave requests with a date-calculating validation modal.
  * **Attendance Logs**: Week-by-week pagination view displaying daily logs (Monday to Sunday) with formatting status badges, check-in/out timestamps, and total worked hours.
* **Admin / HR Experience (Oversight & Control)**:
  * **Employee Directory**: Central listing of members with search query parameters, department filters, and profile details modal drawer.
  * **Leave Approvals Console**: Process pending leave requests inline; click to approve or reject with mandatory comments logged for audit trails.
  * **Attendance Records Overview**: Organization-wide attendance sheet filtering by date, department, and present status.
  * **Salary Management Engine**: Edit and configure employee base salaries, housing/transport allowances, and tax/PF deduction breakdowns.

### 2. Enterprise-Grade Security
* **Stateless Cookie Sessions**: Access and refresh tokens are served via `SameSite=Strict`, `HttpOnly`, and `Secure` cookies to completely lock out XSS (Cross-Site Scripting) and mitigate CSRF (Cross-Site Request Forgery).
* **Password Hashing**: Cryptographic salt protection using `bcryptjs` (12 rounds).
* **Role-Based Guards (RBAC)**: Backend router guards restrict `/api/admin/*` endpoints to HR roles, rejecting unauthorized employee tokens with `403 Forbidden` responses.
* **SQL Injection Prevention**: Forced query parameterization mapped through Prisma Client ORM.

### 3. Modern Design & Performance
* Cal.com-inspired high-contrast confidence monochrome canvas.
* Gray, pulse-animating skeleton loaders to eliminate Layout Shift (CLS).
* Immediate local state transitions (Optimistic UI updates) for checks, updates, and clicks.
* User-specific local storage synchronization keeping mock details persisted across pages.

---

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `^19.2.6` | Core UI Framework |
| | React Router | `^7.18.1` | Client-side declarative nested layouts & guards |
| | Zustand | `^5.0.14` | Global auth and theme states |
| | Tailwind CSS | `^4.0.0` | Styling and visual design |
| | Lucide React | `^1.23.0` | Minimalist icons library |
| **Backend** | Node.js / Express | `v20+ (LTS)` | REST API framework in TypeScript |
| | Prisma | `^5.x` | Database ORM |
| | Zod | `^3.x` | Runtime request payload validation |
| | bcryptjs | `^2.4.3` | Salting and password hashing |
| | jsonwebtoken | `^9.0.2` | Short-term token generation |
| **Database** | MySQL | `8.0+` | InnoDB relational data store |

---

## 📂 Project Directory Structure

```
├── client/                     # React Vite Front-End
│   ├── src/
│   │   ├── assets/             # Brand logos and images
│   │   ├── components/         # Nav shells, ProtectedRoute, UI primitives (shadcn)
│   │   ├── context/            # AuthProvider wrappers
│   │   ├── data/               # Seed arrays and mock definitions
│   │   ├── lib/                # Client router mapping and styling utilities
│   │   ├── pages/              # Employee and Admin views/pages
│   │   ├── stores/             # Zustand stores (auth.store)
│   │   └── types/              # TypeScript declarations
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Express TypeScript Back-End
│   ├── prisma/
│   │   ├── schema.prisma       # Database model layout
│   │   └── seed.ts             # Development seeder logic
│   ├── src/
│   │   ├── lib/                # Prisma client instances
│   │   ├── middleware/         # Auth verification and RBAC guards
│   │   ├── routes/             # REST route handlers (auth, employee, leave, admin)
│   │   ├── utils/              # Token generators and password utils
│   │   ├── validators/         # Zod schemas (auth, employee, leave)
│   │   └── index.ts            # Server bootstrap
│   ├── package.json
│   └── tsconfig.json
```

---

## 🗄️ Database Schema Mapping (`schema.prisma`)

```prisma
enum Role {
  EMPLOYEE
  HR
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  LEAVE
}

enum LeaveType {
  PAID
  SICK
  UNPAID
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  WITHDRAWN
}

model User {
  id                 Int                  @id @default(autoincrement()) @db.UnsignedInt
  employeeId         String               @unique @map("employee_id") @db.VarChar(50)
  email              String               @unique @db.VarChar(255)
  passwordHash       String               @map("password_hash") @db.VarChar(255)
  role               Role                 @default(EMPLOYEE)
  isVerified         Boolean              @default(false) @map("is_verified")
  createdAt          DateTime             @default(now()) @map("created_at") @db.Timestamp
  updatedAt          DateTime             @updatedAt @map("updated_at") @db.Timestamp
  
  profile            Profile?
  attendances        Attendance[]
  leaveRequests      LeaveRequest[]       @relation("EmployeeLeaves")
  reviewedLeaves     LeaveRequest[]       @relation("AdminReviews")
  salaryStructures   SalaryStructure[]
  verificationTokens VerificationToken[]
  refreshTokens      RefreshToken[]

  @@map("users")
}

model Profile {
  id                Int      @id @default(autoincrement()) @db.UnsignedInt
  userId            Int      @unique @map("user_id") @db.UnsignedInt
  fullName          String   @map("full_name") @db.VarChar(255)
  dob               DateTime? @db.Date
  phone             String?  @db.VarChar(20)
  address           String?  @db.Text
  emergencyContact  String?  @map("emergency_contact") @db.VarChar(255)
  profilePictureUrl String?  @map("profile_picture_url") @db.VarChar(512)
  department        String?  @db.VarChar(100)
  designation       String?  @db.VarChar(100)
  dateOfJoining     DateTime? @map("date_of_joining") @db.Date
  reportingManager  String?  @map("reporting_manager") @db.VarChar(100)
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt         DateTime @updatedAt @map("updated_at") @db.Timestamp

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Attendance {
  id        Int              @id @default(autoincrement()) @db.UnsignedInt
  userId    Int              @map("user_id") @db.UnsignedInt
  date      DateTime         @db.Date
  checkIn   DateTime?        @map("check_in") @db.Timestamp
  checkOut  DateTime?        @map("check_out") @db.Timestamp
  status    AttendanceStatus @default(ABSENT)
  createdAt DateTime         @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime         @updatedAt @map("updated_at") @db.Timestamp

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date], name: "userId_date_unique")
  @@map("attendance")
}

model LeaveRequest {
  id              Int         @id @default(autoincrement()) @db.UnsignedInt
  userId          Int         @map("user_id") @db.UnsignedInt
  leaveType       LeaveType   @map("leave_type")
  startDate       DateTime    @map("start_date") @db.Date
  endDate         DateTime    @map("end_date") @db.Date
  totalDays       Int         @map("total_days") @db.UnsignedInt
  status          LeaveStatus @default(PENDING)
  employeeRemarks String?     @map("employee_remarks") @db.Text
  reviewedBy      Int?        @map("reviewed_by") @db.UnsignedInt
  hrComments      String?     @map("hr_comments") @db.Text
  decisionDate    DateTime?   @map("decision_date") @db.Timestamp
  createdAt       DateTime    @default(now()) @map("created_at") @db.Timestamp
  updatedAt       DateTime    @updatedAt @map("updated_at") @db.Timestamp

  user            User        @relation("EmployeeLeaves", fields: [userId], references: [id], onDelete: Cascade)
  reviewer        User?       @relation("AdminReviews", fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@map("leave_requests")
}

model SalaryStructure {
  id            Int      @id @default(autoincrement()) @db.UnsignedInt
  userId        Int      @map("user_id") @db.UnsignedInt
  baseSalary    Decimal  @default(0.00) @map("base_salary") @db.Decimal(12, 2)
  allowances    Json?    // Array of {"label": string, "amount": number}
  deductions    Json?    // Array of {"label": string, "amount": number}
  netPay        Decimal  @default(0.00) @map("net_pay") @db.Decimal(12, 2)
  effectiveDate DateTime @map("effective_date") @db.Date
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamp

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("salary_structures")
}
```

---

## 🛠️ Installation & Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v20+)** and a running **MySQL database** instance.

### 2. Setup Database Connection
Create `/server/.env` and specify your credentials:
```env
DATABASE_URL="mysql://username:password@localhost:3306/hrms_db"
JWT_SECRET="your_high_entropy_secret_string"
```

### 3. Bootstrap Dependencies & Seed Schema
Run concurrently from the workspace root folder:
```bash
# 1. Install all dependencies
npm run install-all

# 2. Run migrations (inside /server)
cd server
npx prisma migrate dev --name init_hrms_schema
npx prisma generate

# 3. Seed initial employee & admin mock credentials
npx prisma db seed
```
*Seed accounts generated: Admin (`hr@company.com` / `Password123!`), Employee (`employee@company.com` / `Password123!`)*.

### 4. Running Locally (Development)
Start client and server concurrently from the root folder:
```bash
npm run dev
```
* This binds the Express backend to `http://localhost:3000`
* This binds the React Vite app to `http://localhost:5173`

---

## 🔌 API Documentation Specification

### 1. Authentication (`/api/auth`)
* `POST /api/auth/signup` - Registers a user, hashes password, saves unverified profile.
* `GET /api/auth/verify-email?token=X` - Verifies token, sets `is_verified = true`.
* `POST /api/auth/login` - Authenticates credentials, writes stateless HTTP-Only JWT cookies.
* `POST /api/auth/logout` - Revokes session token, deletes client-side cookies.

### 2. Employee Self-Service (`/api/employee`)
* `GET /api/employee/profile` - Retrieves complete employee details.
* `PUT /api/employee/profile` - Updates editable profile fields (`phone`, `address`, `profilePictureUrl`).
* `POST /api/employee/attendance/check-in` - Saves check-in timestamp for the current date. Enforces single check-in rule.
* `POST /api/employee/attendance/check-out` - Registers check-out. Succeeds only if check-in exists.
* `GET /api/employee/attendance/history` - Returns date-range filtered logs for weekly layout mapping.
* `POST /api/employee/leave/apply` - Submits a new leave request (validating limits and overlaps).
* `POST /api/employee/leave/:id/withdraw` - Sets a pending leave status to `WITHDRAWN`.

### 3. Admin / HR Operations (`/api/admin`)
* `POST /api/admin/employees` - Provisions an employee card.
* `PUT /api/admin/employees/:id` - Overwrite any profile detail.
* `DELETE /api/admin/employees/:id/deactivate` - Soft-deactivates profile, invalidates refresh tokens.
* `GET /api/admin/attendance` - Overview sheet of organization attendance.
* `PUT /api/admin/leave/approvals/:id` - Approve or reject leaves. Comments are mandatory on rejections.
* `PUT /api/admin/payroll/:id/salary` - Configure employee allowances, deductions, and base wage levels.