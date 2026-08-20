export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Half Day'
  | 'Leave'
  | 'Absent'
  | 'Week Off';

export interface AttendanceEmployeeInfo {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  phone?: string;
  avatarUrl?: string;
  avatarSeed?: string;
  status?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // 'YYYY-MM-DD'
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workingHours: number;
  notes?: string;
  employee?: AttendanceEmployeeInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceTodayStatus {
  today: string;
  checkedIn: boolean;
  checkedOut: boolean;
  currentStatus: string;
  attendance: AttendanceRecord | null;
}

export interface AttendanceDailyHistory {
  date: string;
  status: string;
  isFuture: boolean;
  isWeekOff: boolean;
  attendance: AttendanceRecord | null;
}

export interface AttendanceWeeklyDay {
  date: string;
  dayName: string;
  status: AttendanceStatus | 'Upcoming' | 'Week Off';
  workingHours: number;
  checkIn: string | null;
  checkOut: string | null;
  attendance: AttendanceRecord | null;
}

export interface AttendanceWeeklySummary {
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalWorkingHours: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    absentDays: number;
  };
  days: AttendanceWeeklyDay[];
}

export interface AttendanceMonthlyDay {
  date: string;
  dayNumber: number;
  dayOfWeek: string;
  status: AttendanceStatus | 'Upcoming' | 'Week Off';
  workingHours: number;
  checkIn: string | null;
  checkOut: string | null;
  notes?: string;
  attendance: AttendanceRecord | null;
}

export interface AttendanceMonthlySummary {
  month: number;
  year: number;
  summary: {
    totalDays: number;
    present: number;
    late: number;
    halfDay: number;
    leave: number;
    absent: number;
    weekOff: number;
    workingDaysElapsed: number;
    attendancePercentage: number;
    totalWorkingHours: number;
    averageWorkingHours: number;
  };
  days: AttendanceMonthlyDay[];
}

export interface AdminAttendanceSummary {
  totalEmployees: number;
  present: number;
  late: number;
  halfDay: number;
  leave: number;
  absent: number;
}

export interface AdminAttendanceResponse {
  count: number;
  total: number;
  page: number;
  totalPages: number;
  summary: AdminAttendanceSummary;
  attendance: AttendanceRecord[];
}

export interface GetAdminAttendanceParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateAttendancePayload {
  checkIn?: string | null;
  checkOut?: string | null;
  status?: AttendanceStatus;
  workingHours?: number;
  notes?: string;
  date?: string;
}
