import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getStatus,
  getMyAttendance,
  getEmployeeAttendance,
  getDailyHistory,
  getWeeklyHistory,
  getMonthlyHistory,
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All employee attendance routes require active user authentication
router.use(authenticateToken);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/status', getStatus);
router.get('/my', getMyAttendance);
router.get('/employee/:employeeId', getEmployeeAttendance);
router.get('/history/daily', getDailyHistory);
router.get('/history/weekly', getWeeklyHistory);
router.get('/history/monthly', getMonthlyHistory);

export default router;
