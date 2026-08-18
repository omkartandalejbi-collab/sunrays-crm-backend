import { Router } from 'express';
import { login, getMe, loginSchema } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
