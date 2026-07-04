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

async function main() {
  console.log('Seeding database...');

  // Clean existing records in reverse dependency order
  await prisma.refreshToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const employeePasswordHash = await bcrypt.hash('EmployeePass123!', 12);

  // 1. Create Default Admin/HR account
  const hrUser = await prisma.user.create({
    data: {
      employeeId: 'EMP-HR-001',
      email: 'hr@company.com',
      passwordHash: adminPasswordHash,
      role: 'HR',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Alice Johnson',
          dob: new Date('1988-04-15'),
          phone: '+15550100',
          address: '456 HR Blvd, San Francisco, CA',
          emergencyContact: 'Bob Johnson (+15550101)',
          department: 'Human Resources',
          designation: 'Senior HR Manager',
          dateOfJoining: new Date('2020-01-10'),
          reportingManager: 'Board of Directors',
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
  console.log('Created Admin User: hr@company.com');

  // 2. Create Default Employee account
  const employeeUser = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'employee@company.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      isVerified: true,
      profile: {
        create: {
          fullName: 'John Smith',
          dob: new Date('1993-08-22'),
          phone: '+15550200',
          address: '123 Employee Way, San Francisco, CA',
          emergencyContact: 'Jane Smith (+15550201)',
          department: 'Engineering',
          designation: 'Software Engineer',
          dateOfJoining: new Date('2023-06-01'),
          reportingManager: 'Alice Johnson',
        },
      },
      salaryStructures: {
        create: {
          baseSalary: 6000.00,
          allowances: [
            { label: 'HRA', amount: 600 },
            { label: 'Internet', amount: 50 }
          ],
          deductions: [
            { label: 'Tax', amount: 900 },
            { label: 'Health Insurance', amount: 150 }
          ],
          netPay: 5600.00,
          effectiveDate: new Date('2026-01-01'),
        }
      }
    },
  });
  console.log('Created Employee User: employee@company.com');

  // 3. Create Sample Attendance Logs for Employee
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  await prisma.attendance.createMany({
    data: [
      {
        userId: employeeUser.id,
        date: twoDaysAgo,
        checkIn: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 9, 5, 0),
        checkOut: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 17, 30, 0),
        status: 'PRESENT',
      },
      {
        userId: employeeUser.id,
        date: yesterday,
        checkIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 55, 0),
        checkOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 18, 0, 0),
        status: 'PRESENT',
      },
    ],
  });
  console.log('Seeded sample attendance logs');

  // 4. Create a Sample Leave Request for Employee
  const nextWeekStart = new Date();
  nextWeekStart.setDate(today.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 2);

  await prisma.leaveRequest.create({
    data: {
      userId: employeeUser.id,
      leaveType: 'SICK',
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      totalDays: 3,
      status: 'PENDING',
      employeeRemarks: 'Dental surgery procedure and recovery.',
    },
  });
  console.log('Seeded sample leave request');

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
