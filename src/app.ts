import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import adminAttendanceRoutes from './routes/adminAttendanceRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for local development
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin/employees', userRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/admin/attendance', adminAttendanceRoutes);

  // 404 handler for undefined API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
};
