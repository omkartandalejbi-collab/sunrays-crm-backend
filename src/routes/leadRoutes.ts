import { Router } from 'express';
import multer from 'multer';
import {
  getAllLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  syncGoogleSheet,
  syncExcel,
  bulkAssignLeads,
  deleteLead,
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  syncGoogleSheetSchema,
} from '../controllers/leadController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Lead listings and statistics
router.get('/', getAllLeads);
router.get('/stats', getLeadStats);
router.get('/:id', getLeadById);

// Create and update
router.post('/', validateBody(createLeadSchema), createLead);
router.put('/:id', validateBody(updateLeadSchema), updateLead);
router.patch('/:id/status', validateBody(updateLeadStatusSchema), updateLeadStatus);

// Admin-only synchronization and assignment management
router.post('/sync/google-sheet', requireAdmin, validateBody(syncGoogleSheetSchema), syncGoogleSheet);
router.post('/sync/excel', requireAdmin, upload.single('file'), syncExcel);
router.post('/bulk-assign', requireAdmin, bulkAssignLeads);
router.patch('/:id/assign', requireAdmin, validateBody(assignLeadSchema), assignLead);
router.delete('/:id', requireAdmin, deleteLead);

export default router;
