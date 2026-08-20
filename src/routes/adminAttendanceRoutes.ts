import { Router } from 'express';
import {
  getAdminAttendance,
  updateAdminAttendance,
  createAdminAttendance,
  adminUpdateAttendanceSchema,
  adminCreateAttendanceSchema,
} from '../controllers/attendanceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// All admin attendance routes require authentication and Admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAdminAttendance);
router.post('/', validateBody(adminCreateAttendanceSchema), createAdminAttendance);
router.put('/:id', validateBody(adminUpdateAttendanceSchema), updateAdminAttendance);

export default router;
