# Database Schema & Data Architecture Specification
## Human Resource Management System (HRMS)

**Document Owner:** Senior Backend Engineer  
**Status:** Approved  
**Last Updated:** July 4, 2026  
**Reference Docs:** [PRD (PRD.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/PRD.md) | [TRD (TRD.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/TRD.md) | [App Flow (FLOW.md)](file:///home/aditya/Documents/Projects/odooHackathon/docs/FLOW.md)

---

## 1. Database Architecture & Engine Configuration

- **Database Engine**: MySQL 8.0+ (InnoDB Storage Engine)
- **Character Set**: `utf8mb4` (supporting full unicode characters, emojis for comments, and secure text strings)
- **Collation**: `utf8mb4_0900_ai_ci` (case-insensitive, accent-insensitive collation standard for MySQL 8)
- **Time Zone**: Enforced server-wide as `UTC` (all datetime logs, check-ins, and token expiries are recorded in UTC; timezone conversion is handled on the client side based on local user locations)

---

## 2. Production DDL Script (SQL Schema)

This is the pure SQL (DDL) implementation script reflecting all keys, constraints, foreign key mappings, and table relations.

```sql
-- Disable foreign key checks temporarily during setup to prevent creation order issues
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- Table Structure: users
-- -------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `employee_id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('EMPLOYEE', 'HR') NOT NULL DEFAULT 'EMPLOYEE',
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_employee_id` (`employee_id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: profiles
-- -------------------------------------------------------------
CREATE TABLE `profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `dob` DATE DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `emergency_contact` VARCHAR(255) DEFAULT NULL,
  `profile_picture_url` VARCHAR(512) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `date_of_joining` DATE DEFAULT NULL,
  `reporting_manager` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_profiles_user_id` (`user_id`),
  CONSTRAINT `fk_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: attendance
-- -------------------------------------------------------------
CREATE TABLE `attendance` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIMESTAMP NULL DEFAULT NULL,
  `check_out` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE') NOT NULL DEFAULT 'ABSENT',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_attendance_user_date` (`user_id`, `date`),
  CONSTRAINT `fk_attendance_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: leave_requests
-- -------------------------------------------------------------
CREATE TABLE `leave_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `leave_type` ENUM('PAID', 'SICK', 'UNPAID') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` INT UNSIGNED NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
  `employee_remarks` TEXT DEFAULT NULL,
  `reviewed_by` INT UNSIGNED DEFAULT NULL,
  `hr_comments` TEXT DEFAULT NULL,
  `decision_date` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_leaves_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leaves_reviewer_id` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: salary_structures
-- -------------------------------------------------------------
CREATE TABLE `salary_structures` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `base_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `allowances` JSON DEFAULT NULL, -- Stores structural array format e.g. [{"label": "HRA", "amount": 500}]
  `deductions` JSON DEFAULT NULL, -- Stores structural array format e.g. [{"label": "PF", "amount": 200}]
  `net_pay` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `effective_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_salary_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: verification_tokens
-- -------------------------------------------------------------
CREATE TABLE `verification_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_verification_tokens_token` (`token`),
  CONSTRAINT `fk_verification_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -------------------------------------------------------------
-- Table Structure: refresh_tokens
-- -------------------------------------------------------------
CREATE TABLE `refresh_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_refresh_tokens_token` (`token`),
  CONSTRAINT `fk_refresh_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Re-enable foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 3. Prisma Schema Definition (`schema.prisma`)

For Node.js Express server access, the database maps to the Prisma object modeling engine as follows:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

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

model VerificationToken {
  id        Int      @id @default(autoincrement()) @db.UnsignedInt
  userId    Int      @map("user_id") @db.UnsignedInt
  token     String   @unique @db.VarChar(255)
  expiresAt DateTime @map("expires_at") @db.Timestamp
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("verification_tokens")
}

model RefreshToken {
  id        Int      @id @default(autoincrement()) @db.UnsignedInt
  userId    Int      @map("user_id") @db.UnsignedInt
  token     String   @unique @db.VarChar(500)
  expiresAt DateTime @map("expires_at") @db.Timestamp
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```

---

## 4. Index Optimization Strategy

Indexes are explicitly defined on key query paths to keep database response latency under **50ms** as the employee records table scales.

### Table of Performance-Optimized Indexes

| Table | Index Name | Columns Indexed | Type | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `PRIMARY` | `id` | Clustered | Rapid identification of users. |
| `users` | `idx_users_employee_id` | `employee_id` | Unique B-Tree | Used during authentication and search. |
| `users` | `idx_users_email` | `email` | Unique B-Tree | Primary verification check for login. |
| `profiles` | `idx_profiles_user_id` | `user_id` | Unique B-Tree | Fast lookup when pulling current user profiles. |
| `attendance` | `idx_attendance_user_date`| `user_id`, `date` | Unique B-Tree | **Compound Key**. Prevents duplicate logs; resolves calendar view checks. |
| `leave_requests`| `idx_leaves_user` | `user_id` | Non-Unique B-Tree| Filters all leave logs for individual employee summaries. |
| `leave_requests`| `idx_leaves_status` | `status` | Non-Unique B-Tree| Speeds up Admin queue rendering for "PENDING" reviews. |
| `salary_structures`| `idx_salary_user_eff` | `user_id`, `effective_date`| Compound B-Tree| Locates the active salary structure matching the current calendar month. |

---

## 5. Security & Session Storage Mappings

### 5.1 Refresh Token Storage & Rotation Schema
To secure authentication systems from replay attacks, the database manages persistent sessions utilizing a **Token Rotation Pattern**:
- Every time a client calls `/api/auth/refresh`, the old `refresh_token` record is checked for validity, deleted, and a new verification token pair is generated and sent.
- If a client attempts to refresh using a token that *does not exist* but was logged historically, the server flags this as token reuse/leakage, invalidates all refresh tokens for that user ID, and logs out all active user clients.

### 5.2 Verification Token Lifecycle
- Verification tokens are generated with a strict 24-hour expiration (`expires_at` column).
- A background scheduler running inside MySQL (or triggered periodically via a cron handler on the API server) deletes stale tokens daily:
  ```sql
  DELETE FROM verification_tokens WHERE expires_at < NOW();
  ```

---

## 6. Data Permissions & Ownership Policy Matrix

Data containment policies ensure employees cannot access peers' records, and that financial assets remain protected.

| Resource / Table | Role: Employee (Allowed Actions) | Role: HR/Admin (Allowed Actions) | Backend Ownership Verification Checks (Middleware Logic) |
| :--- | :--- | :--- | :--- |
| **`users`** | Read (Own record only) | Read/Write (All records) | Check `req.user.id == target_user_id` OR `req.user.role == 'HR'`. |
| **`profiles`** | Read (Own), Update (Limited fields: phone, address) | Read/Write (All fields) | Direct checks on `user_id` ownership logic. Blocks modifications to salary fields. |
| **`attendance`** | Read (Own), Write (Check-in/out logs on current date) | Read (All records) | Restricts write actions to the day of check-in (`date = UTC_DATE()`). |
| **`leave_requests`**| Read/Write (Create/Withdraw own requests) | Read/Write (Approve/Reject requests) | Prevents modification of other employees' leave arrays. Prevents self-approval of leave. |
| **`salary_structures`**| Read (Own details only) | Read/Write (All records) | Strictly filters out write permissions for non-admin accounts. |
