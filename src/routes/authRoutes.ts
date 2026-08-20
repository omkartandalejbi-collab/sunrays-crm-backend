import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);

export default router;

