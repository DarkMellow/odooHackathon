import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

function getPastWorkingDays(count: number): Date[] {
  const dates: Date[] = [];
  let dayOffset = 1; // Start from yesterday
  
  while (dates.length < count) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - dayOffset);
    d.setUTCHours(0, 0, 0, 0);
    
    const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(d);
    }
    dayOffset++;
  }
  return dates;
}

function getPastAttendanceData(userId: number, date: Date) {
  const rand = Math.random();
  let status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' = 'PRESENT';
  let checkIn: Date | null = null;
  let checkOut: Date | null = null;

  if (rand < 0.05) {
    status = 'ABSENT';
  } else if (rand < 0.10) {
    status = 'LEAVE';
  } else if (rand < 0.15) {
    status = 'HALF_DAY';
    checkIn = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 9, Math.floor(Math.random() * 20), 0));
    checkOut = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 13, Math.floor(Math.random() * 20), 0));
  } else {
    status = 'PRESENT';
    const checkInHour = Math.random() > 0.5 ? 8 : 9;
    const checkInMinute = checkInHour === 8 ? 45 + Math.floor(Math.random() * 15) : Math.floor(Math.random() * 15);
    checkIn = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), checkInHour, checkInMinute, 0));
    
    const checkOutHour = Math.random() > 0.5 ? 17 : 18;
    const checkOutMinute = Math.floor(Math.random() * 30);
    checkOut = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), checkOutHour, checkOutMinute, 0));
  }

  return {
    userId,
    date,
    checkIn,
    checkOut,
    status,
  };
}

async function main() {
  console.log('Seeding database with realistic HRMS data...');

  // Clean existing records in reverse dependency order
  await prisma.refreshToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.preRegisteredEmployee.deleteMany();

  // Create hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const employeePasswordHash = await bcrypt.hash('EmployeePass123!', 12);

  // Pre-register seeded users
  await prisma.preRegisteredEmployee.createMany({
    data: [
      { employeeId: 'EMP202600', fullName: 'Alex Rivera', department: 'Human Resources', designation: 'HR Manager', role: 'HR', isRegistered: true },
      { employeeId: 'EMP202601', fullName: 'Jane Doe', department: 'Engineering', designation: 'Senior Frontend Engineer', role: 'EMPLOYEE', isRegistered: true },
      { employeeId: 'EMP202603', fullName: 'John Smith', department: 'Engineering', designation: 'Backend Tech Lead', role: 'EMPLOYEE', isRegistered: true },
      { employeeId: 'EMP202604', fullName: 'Emily Davis', department: 'Design', designation: 'Product Designer', role: 'EMPLOYEE', isRegistered: true },
      { employeeId: 'EMP202605', fullName: 'Michael Brown', department: 'Marketing', designation: 'Growth Specialist', role: 'EMPLOYEE', isRegistered: true },
      { employeeId: 'EMP202606', fullName: 'Sarah Connor', department: 'Operations', designation: 'Operations Lead', role: 'EMPLOYEE', isRegistered: true },
    ]
  });

  // 1. Create Alex Rivera (HR Manager)
  const alex = await prisma.user.create({
    data: {
      employeeId: 'EMP202600',
      email: 'hr@company.com',
      passwordHash: adminPasswordHash,
      role: 'HR',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Alex Rivera',
          dob: new Date('1988-07-22'),
          phone: '+1 (555) 234-5678',
          address: '100 Market Street, Suite 500, San Francisco, CA 94105',
          emergencyContact: 'Maria Rivera — +1 (555) 876-5432',
          department: 'Human Resources',
          designation: 'HR Manager',
          dateOfJoining: new Date('2022-06-01'),
          reportingManager: null,
          about: 'Experienced HR Manager specialized in talent acquisition, employee relations, and building strong organizational cultures.',
          loveAboutJob: 'Helping people grow and thrive in their careers.',
          interestsHobbies: 'Cycling, culinary arts, and volunteering.',
          skills: ['Talent Acquisition', 'Employee Relations', 'Leadership'],
          certs: ['SHRM-CP'],
          nationality: 'American',
          personalEmail: 'alex.rivera.personal@example.com',
          gender: 'Male',
          maritalStatus: 'Married',
          bankAccount: '987654321012',
          bankName: 'Wells Fargo',
          ifscCode: 'WELS0987654',
          panNo: 'XYZWV5678A',
          uanNo: '200987654321',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 7500.00,
          allowances: [
            { label: 'HRA', amount: 800 },
            { label: 'Travel', amount: 200 }
          ],
          deductions: [
            { label: 'Tax', amount: 1200 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 7150.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created HR Manager: Alex Rivera (hr@company.com)');
 
  // 2. Create Jane Doe (Senior Frontend Engineer)
  const jane = await prisma.user.create({
    data: {
      employeeId: 'EMP202601',
      email: 'jane.doe@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Jane Doe',
          dob: new Date('1995-03-15'),
          phone: '+1 (555) 012-3456',
          address: '42 Elm Street, Apt 3B, San Francisco, CA 94102',
          emergencyContact: 'John Doe — +1 (555) 987-6543',
          department: 'Engineering',
          designation: 'Senior Frontend Engineer',
          dateOfJoining: new Date('2024-01-15'),
          reportingManager: 'Alex Rivera',
          about: 'Jane is a Senior Frontend Engineer with 5+ years of experience specializing in building premium user experiences, designs, and high-performance Web apps. She is dedicated, detail-oriented, and loves collaborating on design systems.',
          loveAboutJob: 'I love bringing interactive user interfaces to life. Bridging the gap between design and engineering, crafting micro-animations, and building performant dashboard products that delight users every day.',
          interestsHobbies: 'Exploring coastal hiking trails, photographing architecture, playing acoustic guitar, experimenting with creative coding, and reading sci-fi novels.',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js'],
          certs: ['AWS Certified Cloud Practitioner', 'Scrum Alliance CSM'],
          nationality: 'American',
          personalEmail: 'jane.doe.personal@example.com',
          gender: 'Female',
          maritalStatus: 'Married',
          bankAccount: '120987342012',
          bankName: 'Chase Bank',
          ifscCode: 'CHAS0123456',
          panNo: 'ABCDE1234F',
          uanNo: '100987654321',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 4500.00,
          allowances: [
            { label: 'Housing', amount: 800 },
            { label: 'Transport', amount: 200 },
            { label: 'Meal', amount: 150 }
          ],
          deductions: [
            { label: 'Tax', amount: 650 },
            { label: 'Insurance', amount: 180 }
          ],
          netPay: 4820.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee: Jane Doe (jane.doe@company.com)');

  // 3. Create John Smith (Backend Tech Lead)
  const john = await prisma.user.create({
    data: {
      employeeId: 'EMP202603',
      email: 'john.smith@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'John Smith',
          dob: new Date('1990-11-05'),
          phone: '+1 (555) 345-6789',
          address: '789 Pine Road, San Francisco, CA 94103',
          emergencyContact: 'Jane Smith — +1 (555) 765-4321',
          department: 'Engineering',
          designation: 'Backend Tech Lead',
          dateOfJoining: new Date('2023-03-10'),
          reportingManager: 'Alex Rivera',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 6500.00,
          allowances: [
            { label: 'HRA', amount: 700 },
            { label: 'Internet', amount: 50 },
            { label: 'Meal', amount: 150 }
          ],
          deductions: [
            { label: 'Tax', amount: 950 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 6300.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee: John Smith (john.smith@company.com)');

  // 4. Create Emily Davis (Product Designer)
  const emily = await prisma.user.create({
    data: {
      employeeId: 'EMP202604',
      email: 'emily.davis@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Emily Davis',
          dob: new Date('1994-02-18'),
          phone: '+1 (555) 456-7890',
          address: '101 Oak Lane, San Francisco, CA 94104',
          emergencyContact: 'Sarah Davis — +1 (555) 654-3210',
          department: 'Design',
          designation: 'Product Designer',
          dateOfJoining: new Date('2024-05-01'),
          reportingManager: 'Alex Rivera',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 5000.00,
          allowances: [
            { label: 'HRA', amount: 600 },
            { label: 'Transport', amount: 150 }
          ],
          deductions: [
            { label: 'Tax', amount: 700 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 4900.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee: Emily Davis (emily.davis@company.com)');

  // 5. Create Michael Brown (Growth Specialist)
  const michael = await prisma.user.create({
    data: {
      employeeId: 'EMP202605',
      email: 'michael.brown@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Michael Brown',
          dob: new Date('1992-09-12'),
          phone: '+1 (555) 567-8901',
          address: '202 Maple Blvd, San Francisco, CA 94109',
          emergencyContact: 'James Brown — +1 (555) 543-2109',
          department: 'Marketing',
          designation: 'Growth Specialist',
          dateOfJoining: new Date('2025-01-10'),
          reportingManager: 'Alex Rivera',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 4000.00,
          allowances: [
            { label: 'HRA', amount: 500 },
            { label: 'Marketing Bonus', amount: 300 }
          ],
          deductions: [
            { label: 'Tax', amount: 550 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 4100.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee: Michael Brown (michael.brown@company.com)');

  // 6. Create Sarah Connor (Operations Lead)
  const sarah = await prisma.user.create({
    data: {
      employeeId: 'EMP202606',
      email: 'sarah.connor@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Sarah Connor',
          dob: new Date('1985-05-25'),
          phone: '+1 (555) 678-9012',
          address: '303 Cedar Street, San Francisco, CA 94110',
          emergencyContact: 'John Connor — +1 (555) 432-1098',
          department: 'Operations',
          designation: 'Operations Lead',
          dateOfJoining: new Date('2021-11-15'),
          reportingManager: 'Alex Rivera',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 5500.00,
          allowances: [
            { label: 'HRA', amount: 650 },
            { label: 'Travel', amount: 300 }
          ],
          deductions: [
            { label: 'Tax', amount: 800 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 5500.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee: Sarah Connor (sarah.connor@company.com)');

  // --- Seed Leave Requests ---
  console.log('Seeding leave requests...');
  await prisma.leaveRequest.createMany({
    data: [
      // Jane Doe
      {
        userId: jane.id,
        leaveType: 'SICK',
        startDate: new Date('2026-07-10'),
        endDate: new Date('2026-07-10'),
        totalDays: 1,
        status: 'APPROVED',
        employeeRemarks: 'Not feeling well, need rest.',
        reviewedBy: alex.id,
        hrComments: 'Approved. Get well soon.',
        decisionDate: new Date('2026-07-04T10:00:00.000Z'),
      },
      {
        userId: jane.id,
        leaveType: 'PAID',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-22'),
        totalDays: 3,
        status: 'PENDING',
        employeeRemarks: 'Family event, planned well in advance.',
      },
      // John Smith
      {
        userId: john.id,
        leaveType: 'SICK',
        startDate: new Date('2026-07-10'),
        endDate: new Date('2026-07-12'),
        totalDays: 3,
        status: 'PENDING',
        employeeRemarks: 'Wisdom tooth extraction surgery and recovery.',
      },
      // Emily Davis
      {
        userId: emily.id,
        leaveType: 'PAID',
        startDate: new Date('2026-07-15'),
        endDate: new Date('2026-07-20'),
        totalDays: 5,
        status: 'PENDING',
        employeeRemarks: 'Annual summer family vacation trip.',
      },
      // Michael Brown
      {
        userId: michael.id,
        leaveType: 'UNPAID',
        startDate: new Date('2026-07-25'),
        endDate: new Date('2026-07-28'),
        totalDays: 4,
        status: 'PENDING',
        employeeRemarks: 'Personal matters to attend to.',
      },
    ],
  });

  // --- Seed Attendance Logs ---
  console.log('Seeding attendance logs (14 days past history + today)...');
  const pastWorkingDays = getPastWorkingDays(14);
  const now = new Date();
  const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const allEmployees = [alex, jane, john, emily, michael, sarah];
  const attendanceInserts: any[] = [];

  // Seed history for all employees
  for (const emp of allEmployees) {
    for (const pastDay of pastWorkingDays) {
      attendanceInserts.push(getPastAttendanceData(emp.id, pastDay));
    }
  }

  // Seed exact today's attendance matching mock expectations
  // Jane Doe: ABSENT
  attendanceInserts.push({
    userId: jane.id,
    date: utcToday,
    checkIn: null,
    checkOut: null,
    status: 'ABSENT',
  });

  // John Smith: PRESENT (checked in at 09:02 AM)
  attendanceInserts.push({
    userId: john.id,
    date: utcToday,
    checkIn: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 9, 2, 0)),
    checkOut: null,
    status: 'PRESENT',
  });

  // Emily Davis: PRESENT (checked in at 08:55 AM)
  attendanceInserts.push({
    userId: emily.id,
    date: utcToday,
    checkIn: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 55, 0)),
    checkOut: null,
    status: 'PRESENT',
  });

  // Michael Brown: LEAVE
  attendanceInserts.push({
    userId: michael.id,
    date: utcToday,
    checkIn: null,
    checkOut: null,
    status: 'LEAVE',
  });

  // Sarah Connor: HALF_DAY (checked in at 10:15 AM, checked out at 02:30 PM)
  attendanceInserts.push({
    userId: sarah.id,
    date: utcToday,
    checkIn: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 15, 0)),
    checkOut: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 14, 30, 0)),
    status: 'HALF_DAY',
  });

  // Alex Rivera (HR): PRESENT (checked in at 08:45 AM)
  attendanceInserts.push({
    userId: alex.id,
    date: utcToday,
    checkIn: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 45, 0)),
    checkOut: null,
    status: 'PRESENT',
  });

  await prisma.attendance.createMany({
    data: attendanceInserts,
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
