import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { EmployeeLeadCount } from '../../types';

export interface AdminFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  assignmentFilter?: string;
  onAssignmentChange?: (val: string) => void;
  employeeFilter?: string;
  onEmployeeChange?: (val: string) => void;
  dateFilter?: string;
  onDateChange?: (val: string) => void;
  employees?: EmployeeLeadCount[];
  onReset?: () => void;
}

const ALL_STATUSES = [
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
];

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  assignmentFilter = 'all',
  onAssignmentChange,
  employeeFilter = 'all',
  onEmployeeChange,
  dateFilter = 'all',
  onDateChange,
  employees = [],
  onReset,
}) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between py-1">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads by name, company, email, phone, location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card border-border h-10 shadow-sm text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Employee Filter */}
        {onEmployeeChange && (
          <Select value={employeeFilter} onValueChange={(val) => val && onEmployeeChange(val)}>
            <SelectTrigger className="w-[155px] bg-card border-border h-10 shadow-sm text-xs font-medium">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              <SelectItem value="unassigned">Unassigned Only</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Assignment Status Filter */}
        {onAssignmentChange && (
          <Select value={assignmentFilter} onValueChange={(val) => val && onAssignmentChange(val)}>
            <SelectTrigger className="w-[145px] bg-card border-border h-10 shadow-sm text-xs font-medium">
              <SelectValue placeholder="Assignment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Lead Status Filter */}
        <Select value={statusFilter} onValueChange={(val) => val && onStatusChange(val)}>
          <SelectTrigger className="w-[155px] bg-card border-border h-10 shadow-sm text-xs font-medium">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Filter */}
        {onDateChange && (
          <Select value={dateFilter} onValueChange={(val) => val && onDateChange(val)}>
            <SelectTrigger className="w-[135px] bg-card border-border h-10 shadow-sm text-xs font-medium">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Reset Button */}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 px-2.5 text-muted-foreground hover:text-foreground text-xs"
            title="Reset Filters"
          >
            <RotateCcw size={14} className="mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
