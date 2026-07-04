import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import employeeRouter from './routes/employee.routes';
import attendanceRouter from './routes/attendance.routes';
import leaveRouter from './routes/leave.routes';
import adminRouter from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/employee/attendance', attendanceRouter);
app.use('/api/employee/leave', leaveRouter);
app.use('/api/admin', adminRouter);


// Standard health-check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Express TypeScript Server is running!',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
