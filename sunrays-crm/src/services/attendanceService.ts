import api from './api';
import {
  AttendanceRecord,
  AttendanceTodayStatus,
  AttendanceDailyHistory,
  AttendanceWeeklySummary,
  AttendanceMonthlySummary,
  AdminAttendanceResponse,
  GetAdminAttendanceParams,
  UpdateAttendancePayload,
} from '../types/attendance';

export const attendanceService = {
  /**
   * Employee: Check In for today
   */
  checkIn: async (): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      attendance: AttendanceRecord;
    }>('/attendance/check-in');
    return response.data;
  },

  /**
   * Employee: Check Out for today
   */
  checkOut: async (): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      attendance: AttendanceRecord;
    }>('/attendance/check-out');
    return response.data;
  },

  /**
   * Employee: Get today's live status (checkedIn, checkedOut, currentStatus, attendance)
   */
  getCurrentStatus: async (): Promise<AttendanceTodayStatus> => {
    const response = await api.get<AttendanceTodayStatus>('/attendance/status');
    return response.data;
  },

  /**
   * Employee: Get my past attendance records list
   */
  getMyAttendance: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    totalPages: number;
    attendance: AttendanceRecord[];
  }> => {
    const response = await api.get<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      totalPages: number;
      attendance: AttendanceRecord[];
    }>('/attendance/my', { params });
    return response.data;
  },

  /**
   * Employee / Admin: Get specific employee's attendance records list
   */
  getEmployeeAttendance: async (
    employeeId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    totalPages: number;
    attendance: AttendanceRecord[];
  }> => {
    const response = await api.get<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      totalPages: number;
      attendance: AttendanceRecord[];
    }>(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },

  /**
   * Employee: Get daily history for a given date
   */
  getDailyHistory: async (date?: string): Promise<AttendanceDailyHistory> => {
    const response = await api.get<AttendanceDailyHistory>('/attendance/history/daily', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  /**
   * Employee: Get weekly history for the week containing a date
   */
  getWeeklyHistory: async (date?: string): Promise<AttendanceWeeklySummary> => {
    const response = await api.get<AttendanceWeeklySummary>('/attendance/history/weekly', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  /**
   * Employee: Get full monthly breakdown and summary metrics
   */
  getMonthlyHistory: async (month?: number, year?: number): Promise<AttendanceMonthlySummary> => {
    const response = await api.get<AttendanceMonthlySummary>('/attendance/history/monthly', {
      params: { month, year },
    });
    return response.data;
  },

  /**
   * Admin: Get all employees' attendance with filters and pagination
   */
  getAdminAttendance: async (params?: GetAdminAttendanceParams): Promise<AdminAttendanceResponse> => {
    const response = await api.get<AdminAttendanceResponse>('/admin/attendance', { params });
    return response.data;
  },

  /**
   * Admin: Update/correct an attendance record
   */
  updateAttendance: async (
    id: string,
    data: UpdateAttendancePayload
  ): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> => {
    const response = await api.put<{
      success: boolean;
      message: string;
      attendance: AttendanceRecord;
    }>(`/admin/attendance/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Manually log an attendance record
   */
  createAdminAttendance: async (
    data: UpdateAttendancePayload & { employeeId: string; date: string }
  ): Promise<{ success: boolean; message: string; attendance: AttendanceRecord }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      attendance: AttendanceRecord;
    }>('/admin/attendance', data);
    return response.data;
  },
};
