import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  RotateCcw,
  Calendar,
  Clock,
  Edit2,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  X,
  ChevronDown,
  Building2,
  Activity,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { EditAttendanceModal } from '../../components/admin/attendance/EditAttendanceModal';

const DEPARTMENT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Inside Sales', label: 'Inside Sales' },
  { value: 'Business Dev', label: 'Business Dev' },
  { value: 'Management', label: 'Management' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Late', label: 'Late' },
  { value: 'Half Day', label: 'Half Day' },
  { value: 'Leave', label: 'On Leave' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Week Off', label: 'Week Off' },
];

export const AdminAttendance: React.FC = () => {
  const queryClient = useQueryClient();

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal State
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch Attendance Records from MongoDB API
  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance', selectedDate, departmentFilter, statusFilter, searchQuery],
    queryFn: () =>
      attendanceService.getAdminAttendance({
        date: selectedDate ? selectedDate : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100,
      }),
  });

  const rawRecords = data?.attendance || [];
  const summary = data?.summary;

  // Real-time client-side filter overlay for instantaneous UI response
  const records = useMemo(() => {
    return rawRecords.filter((rec) => {
      // 1. Search by Name or Department
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = rec.employee?.name?.toLowerCase() || '';
        const dept = rec.employee?.department?.toLowerCase() || '';
        const desig = rec.employee?.designation?.toLowerCase() || '';
        const notes = rec.notes?.toLowerCase() || '';
        if (!name.includes(q) && !dept.includes(q) && !desig.includes(q) && !notes.includes(q)) {
          return false;
        }
      }

      // 2. Department Filter
      if (departmentFilter !== 'all') {
        if (rec.employee?.department !== departmentFilter) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (rec.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [rawRecords, searchQuery, departmentFilter, statusFilter]);

  const handleReset = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setSearchQuery('');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const getStatusBadge = (status: AttendanceStatus | string) => {
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (departmentFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Attendance & Shift Records</h1>
          <p className="text-body text-muted-foreground mt-1">
            Monitor company-wide employee attendance, working durations, and correct punch logs.
          </p>
        </div>

        {/* Date Selector & Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar size={16} className="text-primary shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none font-mono cursor-pointer"
            />
          </div>

          <Button
            variant={selectedDate ? 'outline' : 'default'}
            size="sm"
            onClick={() => setSelectedDate(selectedDate ? '' : new Date().toISOString().slice(0, 10))}
            className="h-9 text-xs"
          >
            {selectedDate ? 'Show All Dates' : 'Filter by Date'}
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Staff</div>
            <div className="text-xl font-bold text-foreground">{summary?.totalEmployees ?? 0}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Present Today</div>
            <div className="text-xl font-bold text-emerald-500">{summary?.present ?? 0}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Late Arrivals</div>
            <div className="text-xl font-bold text-amber-500">{summary?.late ?? 0}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Half Day / Leave</div>
            <div className="text-xl font-bold text-blue-500">
              {(summary?.halfDay ?? 0) + (summary?.leave ?? 0)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
            <UserX size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Absent Today</div>
            <div className="text-xl font-bold text-rose-500">{summary?.absent ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search by Name and Department */}
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm bg-card border-border shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department, Status Dropdowns & Reset Button */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Department Styled Dropdown */}
            <div className="relative inline-block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Building2 size={15} />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 pl-9 pr-9 text-xs sm:text-sm font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm cursor-pointer appearance-none"
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept.value} value={dept.value} className="bg-popover text-popover-foreground py-1">
                    {dept.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Status Styled Dropdown */}
            <div className="relative inline-block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Activity size={15} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 pl-9 pr-9 text-xs sm:text-sm font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm cursor-pointer appearance-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value} className="bg-popover text-popover-foreground py-1">
                    {st.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-10 px-3.5 text-xs text-muted-foreground hover:text-foreground border-border shadow-sm"
              title="Reset all filters"
            >
              <RotateCcw size={14} className="mr-1.5" />
              Reset
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">
            Attendance Logs {selectedDate ? (
              <span>for <span className="font-mono text-primary">{selectedDate}</span></span>
            ) : (
              <span className="text-muted-foreground">(All Dates)</span>
            )}{' '}
            <span className="text-xs font-normal text-muted-foreground">({records.length} records)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[260px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Working Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    Loading attendance records...
                  </TableCell>
                </TableRow>
              ) : records.length > 0 ? (
                records.map((rec) => (
                  <TableRow key={rec.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={rec.employee?.avatarUrl} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {rec.employee?.name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {rec.employee?.name || 'Unknown Employee'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {rec.employee?.email || '-'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground">
                        {rec.employee?.department || '-'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {rec.employee?.designation || '-'}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-medium">{rec.date}</TableCell>

                    <TableCell className="font-mono text-xs">
                      {formatTime(rec.checkIn)}
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {formatTime(rec.checkOut)}
                    </TableCell>

                    <TableCell className="text-xs font-semibold">
                      {rec.workingHours > 0 ? `${rec.workingHours} hrs` : (rec.checkIn && !rec.checkOut ? 'In Progress' : '--')}
                    </TableCell>

                    <TableCell>{getStatusBadge(rec.status)}</TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {rec.notes || '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-primary hover:bg-primary/10"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No attendance records found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        record={selectedRecord}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
        }}
      />
    </div>
  );
};
