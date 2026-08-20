import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Lead, ILead, LeadStatus, Priority, AssignmentStatus } from '../models/Lead.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { leadDistributionService } from '../services/leadDistributionService.js';
import { sheetSyncService } from '../services/sheetSyncService.js';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  location: z.string().optional().default(''),
  status: z
    .enum([
      'New',
      'Assigned',
      'Contacted',
      'Interested',
      'Follow Up Scheduled',
      'Meeting Scheduled',
      'Converted',
      'Rejected',
      'Busy',
      'Call Later',
      'No Response',
    ])
    .optional()
    .default('New'),
  priority: z.enum(['High', 'Medium', 'Low']).optional().default('Medium'),
  assignedTo: z.string().optional(),
  notes: z.string().optional().default(''),
  nextFollowUpDate: z.string().optional(),
  nextFollowUpTime: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  location: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  notes: z.string().optional(),
  nextFollowUpDate: z.string().nullable().optional(),
  nextFollowUpTime: z.string().nullable().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum([
    'New',
    'Assigned',
    'Contacted',
    'Interested',
    'Follow Up Scheduled',
    'Meeting Scheduled',
    'Converted',
    'Rejected',
    'Busy',
    'Call Later',
    'No Response',
  ]),
  remark: z.string().min(1, 'Remark or note is required'),
  type: z.enum(['Outgoing', 'Incoming', 'Missed', 'System']).optional().default('Outgoing'),
  duration: z.string().optional(),
  outcome: z.string().optional(),
  followUpDate: z.string().nullable().optional(),
  followUpTime: z.string().nullable().optional(),
});

export const assignLeadSchema = z.object({
  employeeId: z.string().nullable().optional(),
  autoAssign: z.boolean().optional().default(false),
  note: z.string().optional(),
});

export const syncGoogleSheetSchema = z.object({
  sheetUrl: z.string().min(1, 'Google Sheet URL or ID is required').optional(),
  sheetGid: z.string().optional().default('0'),
});

const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0] || '';
  return id || '';
};

export const getAllLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const {
    search,
    status,
    assignmentStatus,
    employeeId,
    priority,
    source,
    dateRange,
    startDate,
    endDate,
    page = '1',
    limit = '100',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query: Record<string, any> = {};

  // Role-based visibility: Employees only see their assigned leads
  if (req.user.role === 'employee') {
    query.assignedTo = req.user._id;
  } else if (employeeId && typeof employeeId === 'string' && employeeId !== 'all') {
    if (employeeId === 'unassigned') {
      query.assignmentStatus = 'Unassigned';
    } else if (mongoose.Types.ObjectId.isValid(employeeId)) {
      query.assignedTo = new mongoose.Types.ObjectId(employeeId);
    }
  }

  // Filters
  if (status && typeof status === 'string' && status !== 'all') {
    query.status = status;
  }

  if (assignmentStatus && typeof assignmentStatus === 'string' && assignmentStatus !== 'all') {
    query.assignmentStatus = assignmentStatus;
  }

  if (priority && typeof priority === 'string' && priority !== 'all') {
    query.priority = priority;
  }

  if (source && typeof source === 'string' && source !== 'all') {
    query.source = source;
  }

  if (search && typeof search === 'string') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { company: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { location: searchRegex },
      { assignedEmployeeName: searchRegex },
    ];
  }

  // Date Filtering
  const now = new Date();
  if (dateRange && typeof dateRange === 'string') {
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.createdAt = { $gte: startOfDay };
    } else if (dateRange === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.createdAt = { $gte: startOfYesterday, $lt: endOfYesterday };
    } else if (dateRange === 'this-week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfWeek };
    } else if (dateRange === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: startOfMonth };
    }
  } else if (startDate || endDate) {
    query.createdAt = {};
    if (startDate && typeof startDate === 'string') {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate && typeof endDate === 'string') {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = parseInt(limit as string, 10) === -1 ? 0 : Math.max(1, parseInt(limit as string, 10) || 50);
  const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortBy as string]: sortDirection };

  const [leads, totalCount] = await Promise.all([
    Lead.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Lead.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: leads.length,
    total: totalCount,
    page: pageNum,
    totalPages: limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
    leads: leads.map((lead) => lead.toJSON()),
  });
};

export const getLeadStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const isEmployee = req.user.role === 'employee';
  const baseQuery = isEmployee ? { assignedTo: req.user._id } : {};

  const [
    totalLeads,
    assignedLeads,
    unassignedLeads,
    allLeads,
    employees,
  ] = await Promise.all([
    Lead.countDocuments(baseQuery),
    Lead.countDocuments({ ...baseQuery, assignmentStatus: 'Assigned' }),
    Lead.countDocuments({ ...baseQuery, assignmentStatus: 'Unassigned' }),
    Lead.find(baseQuery, { status: 1, priority: 1, assignedTo: 1 }).lean(),
    User.find({ role: 'employee' }).sort({ name: 1 }).lean(),
  ]);

  // Calculate status counts
  const statusCounts: Record<string, number> = {
    New: 0,
    Assigned: 0,
    Contacted: 0,
    Interested: 0,
    'Follow Up Scheduled': 0,
    'Meeting Scheduled': 0,
    Converted: 0,
    Rejected: 0,
    Busy: 0,
    'Call Later': 0,
    'No Response': 0,
  };

  const employeeLeadMap = new Map<string, { total: number; converted: number; interested: number }>();

  for (const lead of allLeads) {
    if (lead.status && statusCounts[lead.status] !== undefined) {
      statusCounts[lead.status]++;
    }
    if (lead.assignedTo) {
      const empIdStr = lead.assignedTo.toString();
      const existing = employeeLeadMap.get(empIdStr) || { total: 0, converted: 0, interested: 0 };
      existing.total++;
      if (lead.status === 'Converted') existing.converted++;
      if (lead.status === 'Interested') existing.interested++;
      employeeLeadMap.set(empIdStr, existing);
    }
  }

  // Build employee distribution breakdown for Admin
  const employeeLeadCounts = employees.map((emp) => {
    const stats = employeeLeadMap.get(emp._id.toString()) || { total: 0, converted: 0, interested: 0 };
    return {
      employeeId: emp._id.toString(),
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      status: emp.status,
      isAccessEnabled: emp.isAccessEnabled,
      avatarUrl: emp.avatarUrl,
      assignedCount: stats.total || emp.assignedLeads || 0,
      convertedCount: stats.converted,
      interestedCount: stats.interested,
    };
  });

  res.status(200).json({
    success: true,
    stats: {
      totalLeads,
      assignedLeads,
      unassignedLeads,
      statusCounts,
      employeeLeadCounts: isEmployee ? [] : employeeLeadCounts,
    },
  });
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    return;
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  // Check employee access
  if (req.user?.role === 'employee' && lead.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: 'Access denied. You can only access leads assigned to you.' });
    return;
  }

  res.status(200).json({
    success: true,
    lead: lead.toJSON(),
  });
};

export const createLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validatedData = req.body;

  // Duplicate prevention check
  if (validatedData.email || validatedData.phone) {
    const duplicateQuery: Record<string, any>[] = [];
    if (validatedData.email) {
      duplicateQuery.push({ email: validatedData.email.toLowerCase().trim() });
    }
    if (validatedData.phone) {
      duplicateQuery.push({ phone: validatedData.phone.trim() });
    }

    const existingLead = await Lead.findOne({ $or: duplicateQuery });
    if (existingLead) {
      res.status(409).json({
        success: false,
        message: `A lead with this email (${existingLead.email}) or phone (${existingLead.phone}) already exists.`,
        existingLead: existingLead.toJSON(),
      });
      return;
    }
  }

  const lead = new Lead({
    ...validatedData,
    source: 'Manual',
    assignmentStatus: 'Unassigned',
  });

  // Handle assignment
  if (validatedData.assignedTo && mongoose.Types.ObjectId.isValid(validatedData.assignedTo)) {
    const employee = await User.findById(validatedData.assignedTo);
    if (employee && employee.role === 'employee') {
      await leadDistributionService.assignLead(lead, employee, {
        assignedBy: req.user?.name || 'Administrator',
      });
    }
  } else if (req.user?.role === 'employee') {
    // If created by employee, assign to themselves
    await leadDistributionService.assignLead(lead, req.user, {
      assignedBy: req.user.name,
      note: `Created and self-assigned by ${req.user.name}.`,
    });
  } else {
    // If created by admin without specific employee: auto-assign to active employee
    const activeEmployees = await leadDistributionService.getActiveEmployees();
    if (activeEmployees.length > 0) {
      const nextEmp = leadDistributionService.selectNextEmployee(activeEmployees);
      if (nextEmp) {
        await leadDistributionService.assignLead(lead, nextEmp, {
          assignedBy: 'Auto-Assignment',
        });
      }
    } else {
      await lead.save();
    }
  }

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    lead: lead.toJSON(),
  });
};

export const updateLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    return;
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  if (req.user?.role === 'employee' && lead.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: 'Access denied. You can only update leads assigned to you.' });
    return;
  }

  Object.assign(lead, updateData);
  await lead.save();

  res.status(200).json({
    success: true,
    message: 'Lead details updated successfully',
    lead: lead.toJSON(),
  });
};

export const updateLeadStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const { status, remark, type, duration, outcome, followUpDate, followUpTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    return;
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  if (req.user?.role === 'employee' && lead.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: 'Access denied. You can only update leads assigned to you.' });
    return;
  }

  lead.status = status;
  lead.notes = remark;
  lead.lastContactDate = new Date();

  if (followUpDate !== undefined) {
    lead.nextFollowUpDate = followUpDate ? new Date(followUpDate) : null;
  }
  if (followUpTime !== undefined) {
    lead.nextFollowUpTime = followUpTime || '';
  }

  const authorName = req.user?.name || 'CRM User';

  lead.interactionHistory.unshift({
    employee: authorName,
    employeeId: req.user?._id,
    action: 'Status Updated',
    status,
    remark,
    type: type || 'Outgoing',
    duration: duration || '',
    outcome: outcome || status,
    followUpDate: followUpDate || '',
    followUpTime: followUpTime || '',
    createdAt: new Date(),
  });

  await lead.save();

  res.status(200).json({
    success: true,
    message: `Lead status updated to ${status}.`,
    lead: lead.toJSON(),
  });
};

export const assignLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const { employeeId, autoAssign, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    return;
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  const adminName = req.user?.name || 'Administrator';

  if (autoAssign) {
    const activeEmployees = await leadDistributionService.getActiveEmployees();
    if (activeEmployees.length === 0) {
      res.status(400).json({ success: false, message: 'No active sales employees available for assignment.' });
      return;
    }
    const nextEmp = leadDistributionService.selectNextEmployee(activeEmployees);
    if (!nextEmp) {
      res.status(400).json({ success: false, message: 'Could not determine next employee.' });
      return;
    }
    await leadDistributionService.assignLead(lead, nextEmp, {
      assignedBy: adminName,
      note: note || `Auto-assigned to ${nextEmp.name} via round-robin.`,
    });
  } else if (employeeId) {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({ success: false, message: 'Invalid employee ID format' });
      return;
    }
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      res.status(404).json({ success: false, message: 'Sales employee not found' });
      return;
    }
    await leadDistributionService.assignLead(lead, employee, {
      assignedBy: adminName,
      note,
    });
  } else {
    // Unassign lead
    await leadDistributionService.unassignLead(lead, adminName);
  }

  res.status(200).json({
    success: true,
    message: lead.assignedTo
      ? `Lead assigned to ${lead.assignedEmployeeName} successfully.`
      : 'Lead unassigned successfully.',
    lead: lead.toJSON(),
  });
};

export const syncGoogleSheet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { sheetUrl, sheetGid = '0' } = req.body;
  const targetUrl =
    sheetUrl ||
    process.env.GOOGLE_SHEET_URL ||
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv';

  try {
    const rows = await sheetSyncService.fetchGoogleSheetRows(targetUrl, sheetGid);
    if (rows.length === 0) {
      res.status(200).json({
        success: true,
        message: 'Google Sheet was accessed, but no valid data rows were found.',
        report: {
          totalRows: 0,
          newLeadsAdded: 0,
          duplicatesSkipped: 0,
          assignedCount: 0,
          unassignedCount: 0,
          employeeSummary: {},
        },
      });
      return;
    }

    const report = await sheetSyncService.syncLeads(rows, 'Google Sheet');

    res.status(200).json({
      success: true,
      message: `Sync completed: ${report.newLeadsAdded} new leads added, ${report.duplicatesSkipped} duplicates skipped, ${report.assignedCount} assigned.`,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: `Google Sheet synchronization failed: ${error.message}`,
    });
  }
};

export const syncExcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let rows: any[] = [];

    // Check if uploaded via multer (req.file)
    if (req.file && req.file.buffer) {
      rows = sheetSyncService.parseExcelBuffer(req.file.buffer);
    } else if (req.body.fileData) {
      // Base64 file data
      const buffer = Buffer.from(req.body.fileData, 'base64');
      rows = sheetSyncService.parseExcelBuffer(buffer);
    } else if (Array.isArray(req.body.rows)) {
      // Pre-parsed JSON rows
      rows = req.body.rows.map((r: any, idx: number) => sheetSyncService.normalizeRowKeys(r, idx));
    } else {
      res.status(400).json({
        success: false,
        message: 'Please provide an Excel / CSV file or file data to synchronize.',
      });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid lead rows found in the uploaded file.',
      });
      return;
    }

    const report = await sheetSyncService.syncLeads(rows, 'Excel Sheet');

    res.status(200).json({
      success: true,
      message: `Excel sync completed: ${report.newLeadsAdded} new leads added, ${report.duplicatesSkipped} duplicates skipped, ${report.assignedCount} assigned.`,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: `Excel file processing failed: ${error.message}`,
    });
  }
};

export const bulkAssignLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { limit = 100 } = req.body;
  const result = await leadDistributionService.autoAssignUnassignedLeads(Number(limit) || 100);

  res.status(200).json({
    success: true,
    message: `Auto-assigned ${result.assignedCount} unassigned leads to active employees.`,
    assignedCount: result.assignedCount,
    distributionSummary: result.distributionSummary,
  });
};

export const deleteLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    return;
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  if (lead.assignedTo) {
    await User.findByIdAndUpdate(lead.assignedTo, { $inc: { assignedLeads: -1 } });
  }

  await Lead.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `Lead ${lead.name} has been deleted.`,
  });
};
