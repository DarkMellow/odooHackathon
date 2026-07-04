import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Mount authentication routes
app.use('/api/auth', authRouter);

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
