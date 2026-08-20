import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Timer,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { attendanceService } from '../../services/attendanceService';

export const Attendance: React.FC = () => {
  // Current live clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // History Tab & Filter States
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'weekly' | 'monthly'>('overview');
  
  // Daily tab selected date (YYYY-MM-DD)
  const [selectedDailyDate, setSelectedDailyDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  // Monthly tab selected month & year
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // 1. Fetch Today's Live Attendance Status
  const {
    data: todayStatus,
  } = useQuery({
    queryKey: ['attendance-status'],
    queryFn: () => attendanceService.getCurrentStatus(),
    refetchInterval: 15000, // Background sync every 15s
  });

  // 2. Fetch Monthly Summary for Dashboard KPIs
  const {
    data: monthlyData,
    isLoading: isMonthlyLoading,
  } = useQuery({
    queryKey: ['attendance-monthly', selectedMonth, selectedYear],
    queryFn: () => attendanceService.getMonthlyHistory(selectedMonth, selectedYear),
  });

  // 3. Fetch Daily History
  const { data: dailyData } = useQuery({
    queryKey: ['attendance-daily', selectedDailyDate],
    queryFn: () => attendanceService.getDailyHistory(selectedDailyDate),
    enabled: activeTab === 'daily',
  });

  // 4. Fetch Weekly History
  const { data: weeklyData } = useQuery({
    queryKey: ['attendance-weekly', selectedDailyDate],
    queryFn: () => attendanceService.getWeeklyHistory(selectedDailyDate),
    enabled: activeTab === 'weekly',
  });

  // Format Helper
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 font-medium">
            Present
          </Badge>
        );
      case 'Late':
        return (
          <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/20 font-medium">
            Late
          </Badge>
        );
      case 'Half Day':
        return (
          <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/20 font-medium">
            Half Day
          </Badge>
        );
      case 'Leave':
        return (
          <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/20 font-medium">
            On Leave
          </Badge>
        );
      case 'Absent':
        return (
          <Badge className="bg-rose-500/15 text-rose-500 border-rose-500/20 font-medium">
            Absent
          </Badge>
        );
      case 'Week Off':
        return (
          <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/20 font-medium">
            Week Off
          </Badge>
        );
      case 'Upcoming':
        return (
          <Badge className="bg-muted text-muted-foreground border-border font-medium">
            Upcoming
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  // Live Elapsed Working Hours Calculation
  const getElapsedHoursDisplay = () => {
    if (!todayStatus?.checkedIn || !todayStatus.attendance?.checkIn) return null;
    if (todayStatus.checkedOut) {
      return `${todayStatus.attendance.workingHours} hrs`;
    }
    const checkInDate = new Date(todayStatus.attendance.checkIn);
    const diffMs = Math.max(0, currentTime.getTime() - checkInDate.getTime());
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`;
  };

  const todayRecord = todayStatus?.attendance;
  const isCheckedIn = Boolean(todayStatus?.checkedIn);
  const isCheckedOut = Boolean(todayStatus?.checkedOut);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Attendance & Shift Tracker</h1>
          <p className="text-body text-muted-foreground mt-1">
            Standard Shift: <span className="font-semibold text-foreground">09:30 AM – 06:30 PM</span> (8h Work + 1h Break)
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <Clock size={18} className="text-primary animate-pulse" />
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Local System Time</div>
            <div className="text-sm font-semibold text-foreground font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Automatic Attendance Status Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Today's Attendance Status
                </span>
                {todayRecord ? getStatusBadge(todayRecord.status) : getStatusBadge('Not Checked In')}
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] flex items-center gap-1">
                  <Zap size={10} /> Auto-Linked to Login
                </Badge>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {isCheckedOut
                    ? 'Shift Completed'
                    : isCheckedIn
                    ? 'Shift In Progress'
                    : 'Session Active'}
                </h2>
              </div>

              <p className="text-xs text-muted-foreground max-w-md">
                {isCheckedOut
                  ? `Completed full daily attendance upon logout. Logged ${todayRecord?.workingHours || 0} productive hours.`
                  : isCheckedIn
                  ? 'Your attendance was automatically recorded when you logged in. When you log out, your check-out and working duration will be finalized automatically.'
                  : 'Attendance is automatically generated upon employee login.'}
              </p>
            </div>

            {/* Status Indicator Badge */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {isCheckedOut ? (
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                  <CheckCircle2 size={20} />
                  Attendance Completed
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold">
                  <Timer size={20} className="animate-spin text-primary" style={{ animationDuration: '4s' }} />
                  Session Active
                </div>
              )}
            </div>
          </div>

          {/* Today's Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/80">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Check-In Time
              </span>
              <div className="text-base font-semibold text-foreground font-mono">
                {formatTime(todayRecord?.checkIn)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Check-Out Time
              </span>
              <div className="text-base font-semibold text-foreground font-mono">
                {isCheckedOut ? formatTime(todayRecord?.checkOut) : 'Not yet checked out'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                {isCheckedIn && !isCheckedOut ? 'Active Working Hours' : 'Total Work Time'}
              </span>
              <div className="text-base font-semibold text-primary font-mono flex items-center gap-1.5">
                <Timer size={16} />
                {isCheckedIn && !isCheckedOut ? (getElapsedHoursDisplay() || 'In Progress') : (todayRecord?.workingHours ? `${todayRecord.workingHours} hrs` : '--')}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Shift Schedule
              </span>
              <div className="text-base font-semibold text-foreground">
                9h 00m (8h Net)
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Score Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Performance
              </span>
              <Award size={18} className="text-primary" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {monthlyData?.summary?.attendancePercentage ?? '--'}%
              </span>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                <TrendingUp size={13} />
                Consistent
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1.5">
              Attendance rate for{' '}
              <span className="font-semibold text-foreground">
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(selectedYear, selectedMonth - 1))}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border text-center">
            <div className="p-2 rounded-lg bg-muted/40">
              <div className="text-lg font-bold text-emerald-500">
                {monthlyData?.summary?.present ?? 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Present</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40">
              <div className="text-lg font-bold text-amber-500">
                {monthlyData?.summary?.late ?? 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Late</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40">
              <div className="text-lg font-bold text-primary">
                {monthlyData?.summary?.totalWorkingHours ?? 0}h
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Daily / Weekly / Monthly Views */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="bg-muted p-1 rounded-xl h-11">
              <TabsTrigger value="overview" className="rounded-lg px-4 text-xs sm:text-sm font-medium">
                <BarChart3 size={15} className="mr-2" />
                Monthly Breakdown
              </TabsTrigger>
              <TabsTrigger value="weekly" className="rounded-lg px-4 text-xs sm:text-sm font-medium">
                <CalendarDays size={15} className="mr-2" />
                Weekly Log
              </TabsTrigger>
              <TabsTrigger value="daily" className="rounded-lg px-4 text-xs sm:text-sm font-medium">
                <CalendarIcon size={15} className="mr-2" />
                Daily Timeline
              </TabsTrigger>
            </TabsList>

            {/* Controls for Active Tab */}
            {activeTab === 'overview' && (
              <div className="flex items-center gap-2">
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(v) => v && setSelectedMonth(Number(v))}
                >
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(selectedYear)}
                  onValueChange={(v) => v && setSelectedYear(Number(v))}
                >
                  <SelectTrigger className="w-[100px] h-9 text-xs">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2026, 2027].map((yr) => (
                      <SelectItem key={yr} value={String(yr)}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(activeTab === 'daily' || activeTab === 'weekly') && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDailyDate}
                  onChange={(e) => setSelectedDailyDate(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
            )}
          </div>

          {/* TAB 1: Monthly Breakdown & History Table */}
          <TabsContent value="overview" className="mt-4 space-y-5">
            {/* Monthly KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Present Days</div>
                <div className="text-2xl font-bold text-emerald-500 mt-1">
                  {monthlyData?.summary?.present ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Late Arrivals</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">
                  {monthlyData?.summary?.late ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Half Days</div>
                <div className="text-2xl font-bold text-blue-500 mt-1">
                  {monthlyData?.summary?.halfDay ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Approved Leaves</div>
                <div className="text-2xl font-bold text-purple-500 mt-1">
                  {monthlyData?.summary?.leave ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Absences</div>
                <div className="text-2xl font-bold text-rose-500 mt-1">
                  {monthlyData?.summary?.absent ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-muted-foreground">Avg. Work Hours</div>
                <div className="text-2xl font-bold text-primary mt-1">
                  {monthlyData?.summary?.averageWorkingHours ?? 0}h
                </div>
              </div>
            </div>

            {/* Monthly Calendar Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  Monthly Attendance Roster ({monthlyData?.days?.length ?? 0} Days)
                </div>
                <span className="text-xs text-muted-foreground">
                  Shift duration standard is 8.00 hrs
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[100px]">Day</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Working Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks / Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isMonthlyLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          Loading attendance records...
                        </TableCell>
                      </TableRow>
                    ) : monthlyData?.days && monthlyData.days.length > 0 ? (
                      monthlyData.days.map((day) => (
                        <TableRow key={day.date} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-medium">
                            {day.date}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {day.dayOfWeek}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatTime(day.checkIn)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatTime(day.checkOut)}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {day.workingHours > 0 ? `${day.workingHours} hrs` : (day.checkIn && !day.checkOut ? 'In Progress' : '--')}
                          </TableCell>
                          <TableCell>{getStatusBadge(day.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {day.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          No attendance records found for this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Weekly View */}
          <TabsContent value="weekly" className="mt-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Week Period</span>
                <div className="text-base font-semibold text-foreground">
                  {weeklyData?.weekStartDate} to {weeklyData?.weekEndDate}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Weekly Total Hours</div>
                  <div className="text-xl font-bold text-primary font-mono">
                    {weeklyData?.summary?.totalWorkingHours ?? 0} hrs
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly 7-Day Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {weeklyData?.days?.map((day) => (
                <div
                  key={day.date}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{day.dayName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{day.date.slice(8)}</span>
                    </div>
                    <div>{getStatusBadge(day.status)}</div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>In:</span>
                      <span className="font-mono text-foreground font-medium">
                        {formatTime(day.checkIn)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Out:</span>
                      <span className="font-mono text-foreground font-medium">
                        {formatTime(day.checkOut)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary pt-1">
                      <span>Work:</span>
                      <span className="font-mono">{day.workingHours ? `${day.workingHours}h` : (day.checkIn && !day.checkOut ? 'Active' : '--')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: Daily Timeline View */}
          <TabsContent value="daily" className="mt-4 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Daily Attendance Details
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-0.5 font-mono">
                    {selectedDailyDate}
                  </h3>
                </div>
                <div>{dailyData ? getStatusBadge(dailyData.status) : null}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-border">
                <div className="p-4 rounded-xl bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-medium">
                    Check-In Recorded
                  </span>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {formatTime(dailyData?.attendance?.checkIn)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-medium">
                    Check-Out Recorded
                  </span>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {formatTime(dailyData?.attendance?.checkOut)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-medium">
                    Total Duration
                  </span>
                  <div className="text-xl font-bold font-mono text-primary">
                    {dailyData?.attendance?.workingHours
                      ? `${dailyData.attendance.workingHours} hrs`
                      : (dailyData?.attendance?.checkIn && !dailyData?.attendance?.checkOut ? 'In Progress' : '--')}
                  </div>
                </div>
              </div>

              {dailyData?.attendance?.notes && (
                <div className="pt-4 text-xs text-muted-foreground">
                  <strong className="text-foreground">Notes/Remarks:</strong>{' '}
                  {dailyData.attendance.notes}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
