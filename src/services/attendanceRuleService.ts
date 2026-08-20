/**
 * Sunrays Engineering & Solar Tech CRM - Attendance Rules Service
 * 
 * Centralized, configurable business rules for attendance, shift timing,
 * working-hour calculation, and status determination.
 */

export interface AttendanceRuleConfig {
  shiftStartTime: string;       // "09:30" (24h format HH:mm)
  shiftEndTime: string;         // "18:30" (24h format HH:mm)
  lateThresholdTime: string;    // "09:30" (Check-ins strictly after this are marked 'Late')
  expectedWorkHours: number;    // 8.0 hours standard working duration
  breakDurationHours: number;   // 1.0 hour configured break (shift is 9h, net work is 8h)
  minHoursForBreakDeduction: number; // Break deducted only if total shift span exceeds this (e.g. 5.0h)
  fullDayThresholdHours: number; // 8.0 hours minimum for full day
  halfDayThresholdHours: number; // 4.0 hours minimum for half day (below this is 'Absent')
  weekOffDays: number[];        // [0] (0 = Sunday; optional [0, 6] for weekend)
  timezone: string;             // Company local timezone, default "Asia/Kolkata"
}

export const DEFAULT_ATTENDANCE_CONFIG: AttendanceRuleConfig = {
  shiftStartTime: '09:30',
  shiftEndTime: '18:30',
  lateThresholdTime: '09:30',
  expectedWorkHours: 8.0,
  breakDurationHours: 1.0,
  minHoursForBreakDeduction: 5.0,
  fullDayThresholdHours: 8.0,
  halfDayThresholdHours: 4.0,
  weekOffDays: [0], // Sunday
  timezone: 'Asia/Kolkata',
};

export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Half Day'
  | 'Leave'
  | 'Absent'
  | 'Week Off';

export class AttendanceRuleService {
  private config: AttendanceRuleConfig;

  constructor(config: AttendanceRuleConfig = DEFAULT_ATTENDANCE_CONFIG) {
    this.config = config;
  }

  public getConfig(): AttendanceRuleConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AttendanceRuleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Formats a given Date or today's date into 'YYYY-MM-DD' in company timezone.
   */
  public getTodayDateString(date: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.config.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  }

  /**
   * Extracts local HH:mm for comparison from a Date object in company timezone.
   */
  public getLocalTimeString(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.config.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const hour = parts.find((p) => p.type === 'hour')?.value || '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';

    return `${hour}:${minute}`;
  }

  /**
   * Determine initial attendance status on check-in based on late threshold.
   * If checkInTime <= 09:30 AM -> 'Present', else 'Late'
   */
  public calculateInitialStatus(checkInTime: Date): AttendanceStatus {
    const timeStr = this.getLocalTimeString(checkInTime);
    return timeStr > this.config.lateThresholdTime ? 'Late' : 'Present';
  }

  /**
   * Calculates net working hours between check-in and check-out,
   * accounting for configured break policy.
   */
  public calculateWorkingHours(checkInTime: Date, checkOutTime: Date): number {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    if (diffMs <= 0) return 0;

    const totalHours = diffMs / (1000 * 60 * 60);

    let netHours = totalHours;
    if (totalHours >= this.config.minHoursForBreakDeduction) {
      // Deduct configured break duration (1 hour) for standard shifts
      netHours = Math.max(this.config.halfDayThresholdHours, totalHours - this.config.breakDurationHours);
    }

    return Math.round(netHours * 100) / 100;
  }

  /**
   * Determines final status upon checkout based on calculated working hours and initial status.
   * - netHours >= 8.0 -> 'Present' or 'Late' (depending on initial check-in time)
   * - netHours >= 4.0 and < 8.0 -> 'Half Day'
   * - netHours < 4.0 -> 'Absent'
   */
  public calculateFinalStatus(
    checkInTime: Date,
    checkOutTime: Date,
    initialStatus: string = 'Present'
  ): AttendanceStatus {
    const workingHours = this.calculateWorkingHours(checkInTime, checkOutTime);

    if (workingHours >= this.config.fullDayThresholdHours) {
      // Maintain Late if employee was late on arrival, otherwise Present
      return initialStatus === 'Late' ? 'Late' : 'Present';
    } else if (workingHours >= this.config.halfDayThresholdHours) {
      return 'Half Day';
    } else {
      return 'Absent';
    }
  }

  /**
   * Determines if a given date string 'YYYY-MM-DD' falls on a week off (e.g. Sunday).
   */
  public isWeekOff(dateStr: string): boolean {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek = date.getUTCDay();
    return this.config.weekOffDays.includes(dayOfWeek);
  }

  /**
   * Checks if a given date string 'YYYY-MM-DD' is strictly in the future.
   */
  public isFutureDate(dateStr: string): boolean {
    const todayStr = this.getTodayDateString();
    return dateStr > todayStr;
  }
}

export const attendanceRuleService = new AttendanceRuleService();
