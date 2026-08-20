import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { attendanceRuleService } from '../services/attendanceRuleService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  if (!user.isAccessEnabled || user.status === 'Inactive') {
    res.status(403).json({
      success: false,
      message: 'Account access has been deactivated by an administrator.',
      isDeactivated: true,
    });
    return;
  }

  // Automatic attendance on employee login
  if (user.role === 'employee') {
    try {
      const todayStr = attendanceRuleService.getTodayDateString();
      const existing = await Attendance.findOne({ employeeId: user._id, date: todayStr });
      const now = new Date();

      if (!existing) {
        const initialStatus = attendanceRuleService.calculateInitialStatus(now);
        await Attendance.create({
          employeeId: user._id,
          date: todayStr,
          checkIn: now,
          status: initialStatus,
          workingHours: 0,
        });
      } else if (!existing.checkIn) {
        const initialStatus = attendanceRuleService.calculateInitialStatus(now);
        existing.checkIn = now;
        existing.status = initialStatus;
        await existing.save();
      }
      // If today's attendance already has a checkIn timestamp, we DO NOT overwrite it.
    } catch (attError) {
      console.error('[Auto-Attendance Login Error]:', attError);
    }
  }

  const secret = process.env.JWT_SECRET || 'sunrays_crm_jwt_super_secret_production_key_2026';
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user && req.user.role === 'employee') {
    try {
      const todayStr = attendanceRuleService.getTodayDateString();
      const record = await Attendance.findOne({ employeeId: req.user._id, date: todayStr });
      const now = new Date();

      // If record exists with checkIn and hasn't yet recorded checkOut, record checkOut
      if (record && record.checkIn && !record.checkOut) {
        const workingHours = attendanceRuleService.calculateWorkingHours(record.checkIn, now);
        const finalStatus = attendanceRuleService.calculateFinalStatus(
          record.checkIn,
          now,
          record.status
        );
        record.checkOut = now;
        record.workingHours = workingHours;
        record.status = finalStatus;
        await record.save();
      }
    } catch (attError) {
      console.error('[Auto-Attendance Logout Error]:', attError);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { name, phone } = req.body;
  if (name) req.user.name = name.trim();
  if (phone !== undefined) req.user.phone = phone.trim();

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: req.user.toJSON(),
  });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
};
