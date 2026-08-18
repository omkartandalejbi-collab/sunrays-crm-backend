import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleAccessStatus,
  updateModuleAccess,
  resetPassword,
  createEmployeeSchema,
  updateEmployeeSchema,
  toggleStatusSchema,
  updateModulesSchema,
  resetPasswordSchema,
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// All routes here require authentication and Admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validateBody(createEmployeeSchema), createEmployee);
router.put('/:id', validateBody(updateEmployeeSchema), updateEmployee);
router.delete('/:id', deleteEmployee);
router.patch('/:id/status', validateBody(toggleStatusSchema), toggleAccessStatus);
router.patch('/:id/modules', validateBody(updateModulesSchema), updateModuleAccess);
router.post('/:id/reset-password', validateBody(resetPasswordSchema), resetPassword);

export default router;
