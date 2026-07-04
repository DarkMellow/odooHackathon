import type {
  AuthUser,
  Attendance,
  LeaveRequest,
  SalaryStructure,
  ActivityItem,
} from "@/types";

// ─── Current date helpers ──────────────────────────────────────
const now = new Date();
const today = now.toISOString().slice(0, 10);

function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function isoTimestamp(dateStr: string, hours: number, minutes: number): string {
  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// ─── Mock Employee user ────────────────────────────────────────

export const mockEmployeeUser: AuthUser = {
  id: 1,
  employeeId: "EMP202601",
  email: "jane.doe@company.com",
  role: "EMPLOYEE",
  isVerified: true,
  profile: {
    id: 1,
    userId: 1,
    fullName: "Jane Doe",
    dob: "1995-03-15",
    phone: "+1 (555) 012-3456",
    address: "42 Elm Street, Apt 3B, San Francisco, CA 94102",
    emergencyContact: "John Doe — +1 (555) 987-6543",
    profilePictureUrl: null,
    department: "Engineering",
    designation: "Senior Frontend Engineer",
    dateOfJoining: "2024-01-15",
    reportingManager: "Alex Rivera",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
};

export const mockHRUser: AuthUser = {
  id: 2,
  employeeId: "EMP202600",
  email: "hr@company.com",
  role: "HR",
  isVerified: true,
  profile: {
    id: 2,
    userId: 2,
    fullName: "Alex Rivera",
    dob: "1988-07-22",
    phone: "+1 (555) 234-5678",
    address: "100 Market Street, Suite 500, San Francisco, CA 94105",
    emergencyContact: "Maria Rivera — +1 (555) 876-5432",
    profilePictureUrl: null,
    department: "Human Resources",
    designation: "HR Manager",
    dateOfJoining: "2022-06-01",
    reportingManager: null,
    createdAt: "2022-06-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
};

// ─── Today's attendance ────────────────────────────────────────

export const mockTodayAttendance: Attendance = {
  id: 101,
  userId: 1,
  date: today,
  checkIn: null,
  checkOut: null,
  status: "ABSENT",
  createdAt: isoTimestamp(today, 0, 0),
  updatedAt: isoTimestamp(today, 0, 0),
};

// ─── Recent attendance history ─────────────────────────────────

export const mockAttendanceHistory: Attendance[] = [
  {
    id: 100,
    userId: 1,
    date: daysAgo(1),
    checkIn: isoTimestamp(daysAgo(1), 9, 5),
    checkOut: isoTimestamp(daysAgo(1), 17, 12),
    status: "PRESENT",
    createdAt: isoTimestamp(daysAgo(1), 9, 5),
    updatedAt: isoTimestamp(daysAgo(1), 17, 12),
  },
  {
    id: 99,
    userId: 1,
    date: daysAgo(2),
    checkIn: isoTimestamp(daysAgo(2), 8, 58),
    checkOut: isoTimestamp(daysAgo(2), 17, 30),
    status: "PRESENT",
    createdAt: isoTimestamp(daysAgo(2), 8, 58),
    updatedAt: isoTimestamp(daysAgo(2), 17, 30),
  },
  {
    id: 98,
    userId: 1,
    date: daysAgo(3),
    checkIn: null,
    checkOut: null,
    status: "LEAVE",
    createdAt: isoTimestamp(daysAgo(3), 0, 0),
    updatedAt: isoTimestamp(daysAgo(3), 0, 0),
  },
  {
    id: 97,
    userId: 1,
    date: daysAgo(4),
    checkIn: isoTimestamp(daysAgo(4), 9, 15),
    checkOut: isoTimestamp(daysAgo(4), 13, 0),
    status: "HALF_DAY",
    createdAt: isoTimestamp(daysAgo(4), 9, 15),
    updatedAt: isoTimestamp(daysAgo(4), 13, 0),
  },
  {
    id: 96,
    userId: 1,
    date: daysAgo(5),
    checkIn: isoTimestamp(daysAgo(5), 9, 0),
    checkOut: isoTimestamp(daysAgo(5), 17, 45),
    status: "PRESENT",
    createdAt: isoTimestamp(daysAgo(5), 9, 0),
    updatedAt: isoTimestamp(daysAgo(5), 17, 45),
  },
];

// ─── Leave requests ────────────────────────────────────────────

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 10,
    userId: 1,
    leaveType: "SICK",
    startDate: "2026-07-10",
    endDate: "2026-07-10",
    totalDays: 1,
    status: "APPROVED",
    employeeRemarks: "Not feeling well, need rest.",
    reviewedBy: 2,
    hrComments: "Approved. Get well soon.",
    decisionDate: "2026-07-04T10:00:00.000Z",
    createdAt: "2026-07-03T08:00:00.000Z",
    updatedAt: "2026-07-04T10:00:00.000Z",
  },
  {
    id: 11,
    userId: 1,
    leaveType: "PAID",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    totalDays: 3,
    status: "PENDING",
    employeeRemarks: "Family event, planned well in advance.",
    reviewedBy: null,
    hrComments: null,
    decisionDate: null,
    createdAt: "2026-07-02T12:00:00.000Z",
    updatedAt: "2026-07-02T12:00:00.000Z",
  },
];

// ─── Salary structure ──────────────────────────────────────────

export const mockSalary: SalaryStructure = {
  id: 1,
  userId: 1,
  baseSalary: 4500,
  allowances: [
    { label: "Housing", amount: 800 },
    { label: "Transport", amount: 200 },
    { label: "Meal", amount: 150 },
  ],
  deductions: [
    { label: "Tax", amount: 650 },
    { label: "Insurance", amount: 180 },
  ],
  netPay: 4820,
  effectiveDate: "2026-01-01",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

// ─── Activity feed ─────────────────────────────────────────────

export const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "attendance",
    message: `You checked out yesterday at 5:12 PM`,
    timestamp: isoTimestamp(daysAgo(1), 17, 12),
    status: "success",
  },
  {
    id: "act-2",
    type: "attendance",
    message: `You checked in yesterday at 9:05 AM`,
    timestamp: isoTimestamp(daysAgo(1), 9, 5),
    status: "success",
  },
  {
    id: "act-3",
    type: "leave",
    message: "Your Sick Leave for Jul 10 was approved",
    timestamp: "2026-07-04T10:00:00.000Z",
    status: "success",
  },
  {
    id: "act-4",
    type: "leave",
    message: "You applied for Paid Leave (Jul 20 – Jul 22)",
    timestamp: "2026-07-02T12:00:00.000Z",
    status: "info",
  },
  {
    id: "act-5",
    type: "attendance",
    message: `You were on leave ${daysAgo(3).slice(5).replace("-", "/")}`,
    timestamp: isoTimestamp(daysAgo(3), 0, 0),
    status: "info",
  },
];

// ─── Admin Dashboard Mock Data ─────────────────────────────────

export interface MockEmployeeListItem {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  designation: string;
  attendanceStatus: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  checkIn: string | null;
  checkOut: string | null;
}

export const mockEmployees: MockEmployeeListItem[] = [
  {
    id: 1,
    employeeId: "EMP202601",
    fullName: "Jane Doe",
    department: "Engineering",
    designation: "Senior Frontend Engineer",
    attendanceStatus: "ABSENT",
    checkIn: null,
    checkOut: null,
  },
  {
    id: 3,
    employeeId: "EMP202603",
    fullName: "John Smith",
    department: "Engineering",
    designation: "Backend Tech Lead",
    attendanceStatus: "PRESENT",
    checkIn: "09:02 AM",
    checkOut: null,
  },
  {
    id: 4,
    employeeId: "EMP202604",
    fullName: "Emily Davis",
    department: "Design",
    designation: "Product Designer",
    attendanceStatus: "PRESENT",
    checkIn: "08:55 AM",
    checkOut: null,
  },
  {
    id: 5,
    employeeId: "EMP202605",
    fullName: "Michael Brown",
    department: "Marketing",
    designation: "Growth Specialist",
    attendanceStatus: "LEAVE",
    checkIn: null,
    checkOut: null,
  },
  {
    id: 6,
    employeeId: "EMP202606",
    fullName: "Sarah Connor",
    department: "Operations",
    designation: "Operations Lead",
    attendanceStatus: "HALF_DAY",
    checkIn: "10:15 AM",
    checkOut: "02:30 PM",
  },
];

export interface MockPendingLeaveRequest {
  id: number;
  fullName: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  employeeRemarks: string;
}

export const mockPendingLeaveRequests: MockPendingLeaveRequest[] = [
  {
    id: 201,
    fullName: "John Smith",
    employeeId: "EMP202603",
    leaveType: "SICK",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    totalDays: 3,
    employeeRemarks: "Wisdom tooth extraction surgery and recovery.",
  },
  {
    id: 202,
    fullName: "Emily Davis",
    employeeId: "EMP202604",
    leaveType: "PAID",
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    totalDays: 5,
    employeeRemarks: "Annual summer family vacation trip.",
  },
  {
    id: 203,
    fullName: "Michael Brown",
    employeeId: "EMP202605",
    leaveType: "UNPAID",
    startDate: "2026-07-25",
    endDate: "2026-07-28",
    totalDays: 4,
    employeeRemarks: "Personal matters to attend to.",
  },
];
