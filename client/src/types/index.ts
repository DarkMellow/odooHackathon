// ─── Enums (matching SCHEMA.md) ────────────────────────────────

export type Role = "EMPLOYEE" | "HR";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";

export type LeaveType = "PAID" | "SICK" | "UNPAID";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

// ─── Models ────────────────────────────────────────────────────

export interface User {
  id: number;
  employeeId: string;
  email: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  fullName: string;
  dob: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  profilePictureUrl: string | null;
  department: string | null;
  designation: string | null;
  dateOfJoining: string | null;
  reportingManager: string | null;
  createdAt: string;
  updatedAt: string;

  // Extended fields
  about: string | null;
  loveAboutJob: string | null;
  interestsHobbies: string | null;
  skills: string[] | null;
  certs: string[] | null;
  nationality: string | null;
  personalEmail: string | null;
  gender: string | null;
  maritalStatus: string | null;
  bankAccount: string | null;
  bankName: string | null;
  ifscCode: string | null;
  panNo: string | null;
  uanNo: string | null;
}

export interface Attendance {
  id: number;
  userId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  employeeRemarks: string | null;
  reviewedBy: number | null;
  hrComments: string | null;
  decisionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryLineItem {
  label: string;
  amount: number;
}

export interface SalaryStructure {
  id: number;
  userId: number;
  baseSalary: number;
  allowances: SalaryLineItem[] | null;
  deductions: SalaryLineItem[] | null;
  netPay: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Composite / View types ────────────────────────────────────

/** The user object enriched with profile data — what the frontend works with */
export interface AuthUser {
  id: number;
  employeeId: string;
  email: string;
  role: Role;
  isVerified: boolean;
  profile: Profile;
}

/** Activity feed item shown on the dashboard */
export interface ActivityItem {
  id: string;
  type: "attendance" | "leave" | "profile" | "system";
  message: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
}
