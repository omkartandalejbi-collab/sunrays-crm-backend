import React from 'react';
import { Search, Filter, SlidersHorizontal, Download, Columns } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter?: string;
  onStatusChange?: (val: any) => void;
  priorityFilter?: string;
  onPriorityChange?: (val: any) => void;
  dateFilter?: string;
  onDateChange?: (val: any) => void;
  statuses?: string[];
  priorities?: string[];
  onExport?: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  dateFilter,
  onDateChange,
  statuses,
  priorities,
  onExport,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between py-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients, companies, or emails..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card border-border h-10 shadow-sm"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {statuses && onStatusChange && (
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <div className="flex items-center text-foreground">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {priorities && onPriorityChange && (
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[160px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <div className="flex items-center text-foreground">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onDateChange && (
          <Select value={dateFilter} onValueChange={onDateChange}>
            <SelectTrigger className="w-[160px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <Button variant="outline" className="h-10 border-border text-foreground shadow-sm bg-card hidden sm:flex px-3">
          <Columns className="mr-2 h-4 w-4 text-muted-foreground" />
          Columns
        </Button>
        
        {onExport && (
          <Button variant="outline" onClick={onExport} className="h-10 border-border text-foreground shadow-sm bg-card hidden sm:flex px-3">
            <Download className="mr-2 h-4 w-4 text-muted-foreground" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
};
