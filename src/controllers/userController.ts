import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'employee']).default('employee'),
  department: z.string().default('Sales'),
  designation: z.string().default('Sales Executive'),
  phone: z.string().default(''),
  status: z.enum(['Active', 'On Leave', 'Offline', 'Inactive']).default('Active'),
  isAccessEnabled: z.boolean().default(true),
  allowedModules: z.array(z.string()).default([
    'dashboard',
    'assignedClients',
    'followUps',
    'callHistory',
    'profile',
  ]),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'employee']).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Offline', 'Inactive']).optional(),
  isAccessEnabled: z.boolean().optional(),
  allowedModules: z.array(z.string()).optional(),
  performanceScore: z.number().min(0).max(100).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  forcePasswordReset: z.boolean().default(false).optional(),
});

export const updateModulesSchema = z.object({
  allowedModules: z.array(z.string()).min(1, 'At least one module must be allowed'),
});

export const toggleStatusSchema = z.object({
  isAccessEnabled: z.boolean().optional(),
  status: z.enum(['Active', 'On Leave', 'Offline', 'Inactive']).optional(),
});

const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0] || '';
  return id || '';
};

export const getAssignableEmployees = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const employees = await User.find({
    role: 'employee',
    isAccessEnabled: true,
    status: { $nin: ['Inactive', 'Offline'] }
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: employees.length,
    employees: employees.map((emp) => emp.toJSON()),
  });
};

export const getAllEmployees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, department, role, status, isAccessEnabled } = req.query;

  const query: Record<string, any> = {};

  if (search && typeof search === 'string') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  if (department && typeof department === 'string' && department !== 'all') {
    query.department = department;
  }

  if (role && typeof role === 'string' && role !== 'all') {
    query.role = role;
  }

  if (status && typeof status === 'string' && status !== 'all') {
    query.status = status;
  }

  if (isAccessEnabled !== undefined) {
    query.isAccessEnabled = isAccessEnabled === 'true';
  }

  const employees = await User.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: employees.length,
    employees: employees.map((emp) => emp.toJSON()),
  });
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  res.status(200).json({
    success: true,
    employee: employee.toJSON(),
  });
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validatedData = req.body;

  const existingUser = await User.findOne({ email: validatedData.email.toLowerCase().trim() });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    return;
  }

  const avatarSeed = validatedData.name.split(' ')[0] || 'User';

  const user = new User({
    ...validatedData,
    email: validatedData.email.toLowerCase().trim(),
    avatarSeed,
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Employee account created successfully.',
    employee: user.toJSON(),
  });
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  if (updateData.email && updateData.email.toLowerCase() !== employee.email.toLowerCase()) {
    const emailConflict = await User.findOne({
      email: updateData.email.toLowerCase().trim(),
      _id: { $ne: employee._id },
    });
    if (emailConflict) {
      res.status(409).json({ success: false, message: 'This email is already in use by another user.' });
      return;
    }
    updateData.email = updateData.email.toLowerCase().trim();
  }

  if (req.user?._id.toString() === id) {
    if (updateData.role && updateData.role !== 'admin') {
      res.status(400).json({ success: false, message: 'You cannot remove your own administrator privileges.' });
      return;
    }
    if (updateData.isAccessEnabled === false || updateData.status === 'Inactive') {
      res.status(400).json({ success: false, message: 'You cannot deactivate or disable your own account.' });
      return;
    }
  }

  Object.assign(employee, updateData);
  await employee.save();

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully.',
    employee: employee.toJSON(),
  });
};

export const deleteEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  if (req.user?._id.toString() === id) {
    res.status(400).json({ success: false, message: 'You cannot delete your own administrator account.' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  if (employee.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isAccessEnabled: true });
    if (adminCount <= 1) {
      res.status(400).json({ success: false, message: 'Cannot delete the sole administrator account.' });
      return;
    }
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `Account for ${employee.name} has been deleted.`,
  });
};

export const toggleAccessStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const { isAccessEnabled, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  if (req.user?._id.toString() === id && (isAccessEnabled === false || status === 'Inactive')) {
    res.status(400).json({ success: false, message: 'You cannot disable your own administrator access.' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  if (isAccessEnabled !== undefined) {
    employee.isAccessEnabled = isAccessEnabled;
    if (!isAccessEnabled && employee.status === 'Active') {
      employee.status = 'Inactive';
    } else if (isAccessEnabled && employee.status === 'Inactive') {
      employee.status = 'Active';
    }
  }

  if (status !== undefined) {
    employee.status = status;
    if (status === 'Inactive') {
      employee.isAccessEnabled = false;
    } else if (status === 'Active') {
      employee.isAccessEnabled = true;
    }
  }

  await employee.save();

  res.status(200).json({
    success: true,
    message: `Access status updated for ${employee.name}.`,
    employee: employee.toJSON(),
  });
};

export const updateModuleAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const { allowedModules } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  employee.allowedModules = allowedModules;
  await employee.save();

  res.status(200).json({
    success: true,
    message: `Application module access updated for ${employee.name}.`,
    employee: employee.toJSON(),
  });
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);
  const { newPassword, forcePasswordReset } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    return;
  }

  const employee = await User.findById(id);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  employee.password = newPassword;
  if (forcePasswordReset !== undefined) {
    employee.forcePasswordReset = forcePasswordReset;
  }
  await employee.save();

  res.status(200).json({
    success: true,
    message: `Password has been reset successfully for ${employee.name}.`,
  });
};
