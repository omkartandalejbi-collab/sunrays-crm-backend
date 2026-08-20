import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Attendance, IAttendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  attendanceRuleService,
  AttendanceStatus,
} from '../services/attendanceRuleService.js';

// Validation Schemas
export const adminUpdateAttendanceSchema = z.object({
  checkIn: z.string().datetime({ offset: true }).nullable().optional(),
  checkOut: z.string().datetime({ offset: true }).nullable().optional(),
  status: z
    .enum(['Present', 'Late', 'Half Day', 'Leave', 'Absent', 'Week Off'])
    .optional(),
  workingHours: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
});

export const adminCreateAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  checkIn: z.string().datetime({ offset: true }).nullable().optional(),
  checkOut: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(['Present', 'Late', 'Half Day', 'Leave', 'Absent', 'Week Off']).default('Present'),
  workingHours: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional(),
});

// Helper for dates
const isValidDateString = (str: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(str);

/**
 * EMPLOYEE: Check-In for Today
 * POST /api/attendance/check-in
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const todayStr = attendanceRuleService.getTodayDateString();
  const now = new Date();

  try {
    // Check if attendance record already exists
    const existing = await Attendance.findOne({ employeeId, date: todayStr });
    if (existing && existing.checkIn) {
      res.status(409).json({
        success: false,
        message: 'You have already checked in for today.',
        attendance: existing.toJSON(),
      });
      return;
    }

    const initialStatus = attendanceRuleService.calculateInitialStatus(now);

    let record: IAttendance;
    if (existing) {
      // Existing record (e.g. previously scheduled leave/placeholder), update checkIn
      existing.checkIn = now;
      existing.status = initialStatus;
      await existing.save();
      record = existing;
    } else {
      record = await Attendance.create({
        employeeId,
        date: todayStr,
        checkIn: now,
        status: initialStatus,
        workingHours: 0,
      });
    }

    res.status(201).json({
      success: true,
      message: `Check-in recorded successfully. Status: ${record.status}`,
      attendance: record.toJSON(),
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Concurrent duplicate check-in detected. Attendance already recorded for today.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in. Please try again.',
    });
  }
};

/**
 * EMPLOYEE: Check-Out for Today
 * POST /api/attendance/check-out
 */
export const checkOut = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const todayStr = attendanceRuleService.getTodayDateString();
  const now = new Date();

  try {
    const record = await Attendance.findOne({ employeeId, date: todayStr });

    if (!record || !record.checkIn) {
      res.status(400).json({
        success: false,
        message: 'No check-in record found for today. You must check in before checking out.',
      });
      return;
    }

    if (record.checkOut) {
      res.status(409).json({
        success: false,
        message: 'You have already checked out for today.',
        attendance: record.toJSON(),
      });
      return;
    }

    if (now.getTime() < record.checkIn.getTime()) {
      res.status(400).json({
        success: false,
        message: 'Check-out timestamp cannot be earlier than check-in timestamp.',
      });
      return;
    }

    // Calculate working hours and final status
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

    res.status(200).json({
      success: true,
      message: `Check-out recorded successfully. Total working duration: ${workingHours} hours.`,
      attendance: record.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record check-out. Please try again.',
    });
  }
};

/**
 * EMPLOYEE: Get Today's Status
 * GET /api/attendance/status
 */
export const getStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const todayStr = attendanceRuleService.getTodayDateString();

  try {
    const record = await Attendance.findOne({ employeeId, date: todayStr });

    const isCheckedIn = Boolean(record && record.checkIn);
    const isCheckedOut = Boolean(record && record.checkOut);

    let currentStatus = 'Not Checked In';
    if (record) {
      currentStatus = record.status;
    }

    const attendanceJson = record ? record.toJSON() : null;

    res.status(200).json({
      success: true,
      today: todayStr,
      checkedIn: isCheckedIn,
      checkedOut: isCheckedOut,
      currentStatus,
      attendance: attendanceJson,
      data: {
        date: todayStr,
        checkIn: record?.checkIn ? record.checkIn.toISOString() : null,
        checkOut: record?.checkOut ? record.checkOut.toISOString() : null,
        workingHours: record?.workingHours ?? null,
        status: currentStatus,
        isCheckedIn,
        isCheckedOut,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance status.',
    });
  }
};

/**
 * EMPLOYEE / ADMIN: Get Employee-Specific Attendance
 * GET /api/attendance/employee/:employeeId
 */
export const getEmployeeAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const targetEmployeeId = Array.isArray(req.params.employeeId)
    ? req.params.employeeId[0]
    : req.params.employeeId;

  if (!targetEmployeeId || !mongoose.Types.ObjectId.isValid(targetEmployeeId)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID.' });
    return;
  }

  // Security authorization: employees can ONLY view their own records; Admins can view any employee's records
  if (req.user.role !== 'admin' && req.user._id.toString() !== targetEmployeeId) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own attendance records.',
    });
    return;
  }

  const { startDate, endDate, status, page = 1, limit = 30 } = req.query;
  const query: Record<string, any> = { employeeId: targetEmployeeId };

  if (startDate && typeof startDate === 'string' && isValidDateString(startDate)) {
    query.date = { ...query.date, $gte: startDate };
  }
  if (endDate && typeof endDate === 'string' && isValidDateString(endDate)) {
    query.date = { ...query.date, $lte: endDate };
  }
  if (status && typeof status === 'string' && status !== 'all') {
    query.status = status;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));
  const skip = (pageNum - 1) * limitNum;

  try {
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      attendance: records.map((r) => r.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee attendance history.',
    });
  }
};

/**
 * EMPLOYEE: Get My Attendance Records (Paginated / Filtered)
 * GET /api/attendance/my
 */
export const getMyAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const { startDate, endDate, status, page = 1, limit = 30 } = req.query;

  const query: Record<string, any> = { employeeId };

  if (startDate && typeof startDate === 'string' && isValidDateString(startDate)) {
    query.date = { ...query.date, $gte: startDate };
  }
  if (endDate && typeof endDate === 'string' && isValidDateString(endDate)) {
    query.date = { ...query.date, $lte: endDate };
  }
  if (status && typeof status === 'string' && status !== 'all') {
    query.status = status;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));
  const skip = (pageNum - 1) * limitNum;

  try {
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      attendance: records.map((r) => r.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance history.',
    });
  }
};

/**
 * EMPLOYEE: Get Daily History
 * GET /api/attendance/history/daily
 */
export const getDailyHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const dateStr =
    typeof req.query.date === 'string' && isValidDateString(req.query.date)
      ? req.query.date
      : attendanceRuleService.getTodayDateString();

  try {
    const record = await Attendance.findOne({ employeeId, date: dateStr });
    const isFuture = attendanceRuleService.isFutureDate(dateStr);
    const isWeekOff = attendanceRuleService.isWeekOff(dateStr);

    let calculatedStatus: string;
    if (record) {
      calculatedStatus = record.status;
    } else if (isFuture) {
      calculatedStatus = 'Upcoming';
    } else if (isWeekOff) {
      calculatedStatus = 'Week Off';
    } else {
      calculatedStatus = 'Absent';
    }

    res.status(200).json({
      success: true,
      date: dateStr,
      status: calculatedStatus,
      isFuture,
      isWeekOff,
      attendance: record ? record.toJSON() : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily attendance history.',
    });
  }
};

/**
 * EMPLOYEE: Get Weekly History
 * GET /api/attendance/history/weekly
 */
export const getWeeklyHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const baseDateStr =
    typeof req.query.date === 'string' && isValidDateString(req.query.date)
      ? req.query.date
      : attendanceRuleService.getTodayDateString();

  const [y, m, d] = baseDateStr.split('-').map(Number);
  const baseDate = new Date(Date.UTC(y, m - 1, d));

  // Determine Monday of this week
  const dayOfWeek = baseDate.getUTCDay(); // 0 is Sun, 1 is Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(baseDate);
  monday.setUTCDate(baseDate.getUTCDate() + diffToMonday);

  const days: {
    date: string;
    dayName: string;
    status: AttendanceStatus | 'Upcoming' | 'Week Off';
    workingHours: number;
    checkIn: string | null;
    checkOut: string | null;
    attendance: any | null;
  }[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekDates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(monday);
    curDate.setUTCDate(monday.getUTCDate() + i);
    const dateFormatted = curDate.toISOString().slice(0, 10);
    weekDates.push(dateFormatted);
  }

  const startDate = weekDates[0];
  const endDate = weekDates[6];

  try {
    const records = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const recordMap = new Map<string, IAttendance>();
    records.forEach((r) => recordMap.set(r.date, r));

    let totalWorkingHours = 0;
    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let absentDays = 0;

    for (let i = 0; i < 7; i++) {
      const curDateStr = weekDates[i];
      const record = recordMap.get(curDateStr);
      const isFuture = attendanceRuleService.isFutureDate(curDateStr);
      const isWeekOff = attendanceRuleService.isWeekOff(curDateStr);

      let status: AttendanceStatus | 'Upcoming' | 'Week Off';
      let hours = 0;

      if (record) {
        status = record.status;
        hours = record.workingHours || 0;
        totalWorkingHours += hours;
        if (record.status === 'Present') presentDays++;
        else if (record.status === 'Late') lateDays++;
        else if (record.status === 'Half Day') halfDays++;
        else if (record.status === 'Absent') absentDays++;
      } else if (isFuture) {
        status = 'Upcoming';
      } else if (isWeekOff) {
        status = 'Week Off';
      } else {
        status = 'Absent';
        absentDays++;
      }

      days.push({
        date: curDateStr,
        dayName: dayNames[i],
        status,
        workingHours: hours,
        checkIn: record?.checkIn ? record.checkIn.toISOString() : null,
        checkOut: record?.checkOut ? record.checkOut.toISOString() : null,
        attendance: record ? record.toJSON() : null,
      });
    }

    res.status(200).json({
      success: true,
      weekStartDate: startDate,
      weekEndDate: endDate,
      summary: {
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        presentDays,
        lateDays,
        halfDays,
        absentDays,
      },
      days,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly attendance history.',
    });
  }
};

/**
 * EMPLOYEE: Get Monthly History & Aggregate Summary
 * GET /api/attendance/history/monthly
 */
export const getMonthlyHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const employeeId = req.user._id;
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;

  if (month < 1 || month > 12 || year < 2000 || year > 2100) {
    res.status(400).json({ success: false, message: 'Invalid month or year provided.' });
    return;
  }

  const monthPadded = String(month).padStart(2, '0');
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDate = `${year}-${monthPadded}-01`;
  const endDate = `${year}-${monthPadded}-${String(daysInMonth).padStart(2, '0')}`;

  try {
    const records = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const recordMap = new Map<string, IAttendance>();
    records.forEach((r) => recordMap.set(r.date, r));

    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    let weekOffCount = 0;
    let totalWorkingHours = 0;
    let workingDaysElapsed = 0;

    const days: {
      date: string;
      dayNumber: number;
      dayOfWeek: string;
      status: AttendanceStatus | 'Upcoming' | 'Week Off';
      workingHours: number;
      checkIn: string | null;
      checkOut: string | null;
      notes?: string;
      attendance: any | null;
    }[] = [];

    const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayPadded = String(day).padStart(2, '0');
      const curDateStr = `${year}-${monthPadded}-${dayPadded}`;
      const record = recordMap.get(curDateStr);
      const isFuture = attendanceRuleService.isFutureDate(curDateStr);
      const isWeekOff = attendanceRuleService.isWeekOff(curDateStr);

      const dObj = new Date(Date.UTC(year, month - 1, day));
      const dayOfWeekName = weekDayNames[dObj.getUTCDay()];

      let status: AttendanceStatus | 'Upcoming' | 'Week Off';
      let hours = 0;

      if (record) {
        status = record.status;
        hours = record.workingHours || 0;
        totalWorkingHours += hours;

        if (status === 'Present') presentCount++;
        else if (status === 'Late') lateCount++;
        else if (status === 'Half Day') halfDayCount++;
        else if (status === 'Leave') leaveCount++;
        else if (status === 'Absent') absentCount++;
        else if (status === 'Week Off') weekOffCount++;

        if (!isWeekOff && status !== 'Week Off') {
          workingDaysElapsed++;
        }
      } else if (isFuture) {
        status = 'Upcoming';
      } else if (isWeekOff) {
        status = 'Week Off';
        weekOffCount++;
      } else {
        status = 'Absent';
        absentCount++;
        workingDaysElapsed++;
      }

      days.push({
        date: curDateStr,
        dayNumber: day,
        dayOfWeek: dayOfWeekName,
        status,
        workingHours: hours,
        checkIn: record?.checkIn ? record.checkIn.toISOString() : null,
        checkOut: record?.checkOut ? record.checkOut.toISOString() : null,
        notes: record?.notes,
        attendance: record ? record.toJSON() : null,
      });
    }

    // Effective attendance percentage = ((present + late + 0.5 * halfDay) / workingDaysElapsed) * 100
    const attendedUnits = presentCount + lateCount + halfDayCount * 0.5;
    const attendancePercentage =
      workingDaysElapsed > 0
        ? Math.min(100, Math.round((attendedUnits / workingDaysElapsed) * 10000) / 100)
        : 100;

    res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalDays: daysInMonth,
        present: presentCount,
        late: lateCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        absent: absentCount,
        weekOff: weekOffCount,
        workingDaysElapsed,
        attendancePercentage,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        averageWorkingHours:
          presentCount + lateCount + halfDayCount > 0
            ? Math.round(
                (totalWorkingHours / (presentCount + lateCount + halfDayCount)) * 100
              ) / 100
            : 0,
      },
      days,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly attendance history.',
    });
  }
};

/**
 * ADMIN: Get All Employees' Attendance (Filterable, Paginated, Summary Included)
 * GET /api/admin/attendance
 */
export const getAdminAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    date,
    startDate,
    endDate,
    employeeId,
    department,
    status,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  try {
    const query: Record<string, any> = {};

    // Date filtering
    if (startDate && typeof startDate === 'string' && isValidDateString(startDate)) {
      query.date = { ...query.date, $gte: startDate };
    }
    if (endDate && typeof endDate === 'string' && isValidDateString(endDate)) {
      query.date = { ...query.date, $lte: endDate };
    }
    if (!startDate && !endDate && date && typeof date === 'string' && isValidDateString(date)) {
      query.date = date;
    }

    if (employeeId && typeof employeeId === 'string' && employeeId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employeeId = employeeId;
      }
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query.status = status;
    }

    // Filter by employee department or search name/email if specified
    if ((department && department !== 'all') || (search && typeof search === 'string' && search.trim())) {
      const userFilter: Record<string, any> = {};
      if (department && department !== 'all') {
        userFilter.department = department;
      }
      if (search && typeof search === 'string' && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        userFilter.$or = [
          { name: searchRegex },
          { department: searchRegex },
          { designation: searchRegex },
          { phone: searchRegex },
        ];
      }
      const matchedUsers = await User.find(userFilter).select('_id');
      const userIds = matchedUsers.map((u) => u._id);
      if (query.employeeId) {
        // Intersect
        if (!userIds.some((id) => id.toString() === query.employeeId.toString())) {
          res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page: 1,
            totalPages: 1,
            summary: {
              totalEmployees: 0,
              present: 0,
              late: 0,
              halfDay: 0,
              leave: 0,
              absent: 0,
            },
            attendance: [],
          });
          return;
        }
      } else {
        query.employeeId = { $in: userIds };
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employeeId', 'name email department designation phone avatarUrl avatarSeed status')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute Summary for queried scope / today
    const targetDate = typeof date === 'string' && isValidDateString(date)
      ? date
      : (typeof startDate === 'string' && isValidDateString(startDate) ? startDate : attendanceRuleService.getTodayDateString());

    const totalActiveEmployees = await User.countDocuments({ role: 'employee', isAccessEnabled: true });
    
    // Aggregation for today's summary stats
    const todayRecords = await Attendance.find({ date: targetDate });
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let leaveCount = 0;
    let absentCount = 0;

    todayRecords.forEach((r) => {
      if (r.status === 'Present') presentCount++;
      else if (r.status === 'Late') lateCount++;
      else if (r.status === 'Half Day') halfDayCount++;
      else if (r.status === 'Leave') leaveCount++;
      else if (r.status === 'Absent') absentCount++;
    });

    const recordedCount = todayRecords.length;
    // Unaccounted active employees on a past/present working day are effectively absent
    const isFuture = attendanceRuleService.isFutureDate(targetDate);
    const isWeekOff = attendanceRuleService.isWeekOff(targetDate);

    if (!isFuture && !isWeekOff) {
      absentCount += Math.max(0, totalActiveEmployees - recordedCount);
    }

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      summary: {
        totalEmployees: totalActiveEmployees,
        present: presentCount,
        late: lateCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        absent: absentCount,
      },
      attendance: records.map((r) => {
        const json: Record<string, any> = r.toJSON();
        const emp = r.employeeId as any;
        if (emp && typeof emp === 'object') {
          json.employee = {
            id: emp._id ? emp._id.toString() : emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department,
            designation: emp.designation,
            phone: emp.phone,
            avatarUrl: emp.avatarUrl,
            avatarSeed: emp.avatarSeed,
            status: emp.status,
          };
        }
        return json;
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin attendance data.',
    });
  }
};

/**
 * ADMIN: Update/Correct Attendance Record
 * PUT /api/admin/attendance/:id
 */
export const updateAdminAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid attendance record ID.' });
    return;
  }

  try {
    const record = await Attendance.findById(id);
    if (!record) {
      res.status(404).json({ success: false, message: 'Attendance record not found.' });
      return;
    }

    const { checkIn, checkOut, status, workingHours, notes, date } = req.body;

    if (date && isValidDateString(date)) {
      record.date = date;
    }

    if (checkIn !== undefined) {
      record.checkIn = checkIn ? new Date(checkIn) : undefined;
    }

    if (checkOut !== undefined) {
      record.checkOut = checkOut ? new Date(checkOut) : undefined;
    }

    if (record.checkIn && record.checkOut) {
      if (record.checkOut.getTime() < record.checkIn.getTime()) {
        res.status(400).json({
          success: false,
          message: 'Check-out timestamp cannot be earlier than check-in timestamp.',
        });
        return;
      }
      // If working hours was not manually specified, recalculate from checkIn and checkOut
      if (workingHours === undefined) {
        record.workingHours = attendanceRuleService.calculateWorkingHours(
          record.checkIn,
          record.checkOut
        );
      } else {
        record.workingHours = workingHours;
      }
    } else if (workingHours !== undefined) {
      record.workingHours = workingHours;
    }

    if (status) {
      record.status = status as AttendanceStatus;
    } else if (record.checkIn && record.checkOut && !status) {
      // Auto-recalculate status if not explicitly overridden
      record.status = attendanceRuleService.calculateFinalStatus(
        record.checkIn,
        record.checkOut,
        record.status
      );
    }

    if (notes !== undefined) {
      record.notes = notes.trim();
    }

    await record.save();
    await record.populate('employeeId', 'name email department designation phone avatarUrl avatarSeed');

    const json: Record<string, any> = record.toJSON();
    const emp = record.employeeId as any;
    if (emp && typeof emp === 'object') {
      json.employee = {
        id: emp._id ? emp._id.toString() : emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        avatarUrl: emp.avatarUrl,
        avatarSeed: emp.avatarSeed,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      attendance: json,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'An attendance record already exists for this employee on that date.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record.',
    });
  }
};

/**
 * ADMIN: Manually Create/Log Attendance Record
 * POST /api/admin/attendance
 */
export const createAdminAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { employeeId, date, checkIn, checkOut, status, workingHours, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    res.status(400).json({ success: false, message: 'Invalid employee ID.' });
    return;
  }

  try {
    const user = await User.findById(employeeId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    const checkInDate = checkIn ? new Date(checkIn) : undefined;
    const checkOutDate = checkOut ? new Date(checkOut) : undefined;

    if (checkInDate && checkOutDate && checkOutDate.getTime() < checkInDate.getTime()) {
      res.status(400).json({
        success: false,
        message: 'Check-out timestamp cannot be earlier than check-in timestamp.',
      });
      return;
    }

    let calculatedHours = workingHours || 0;
    if (checkInDate && checkOutDate && workingHours === undefined) {
      calculatedHours = attendanceRuleService.calculateWorkingHours(checkInDate, checkOutDate);
    }

    let determinedStatus = status;
    if (!determinedStatus) {
      if (checkInDate && checkOutDate) {
        determinedStatus = attendanceRuleService.calculateFinalStatus(
          checkInDate,
          checkOutDate
        );
      } else if (checkInDate) {
        determinedStatus = attendanceRuleService.calculateInitialStatus(checkInDate);
      } else {
        determinedStatus = 'Present';
      }
    }

    const record = await Attendance.create({
      employeeId,
      date,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: determinedStatus,
      workingHours: calculatedHours,
      notes: notes || '',
    });

    await record.populate('employeeId', 'name email department designation phone avatarUrl avatarSeed');

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully.',
      attendance: record.toJSON(),
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'An attendance record already exists for this employee on that date.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create attendance record.',
    });
  }
};
