import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export interface AdminFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const ALL_STATUSES = [
  'New',
  'Contacted',
  'Interested',
  'Follow Up Scheduled',
  'Meeting Scheduled',
  'Converted',
  'Rejected',
  'Lost'
];

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between py-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, email, or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card border-border h-10 shadow-sm"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(val) => { if (val) onStatusChange(val); }}>
          <SelectTrigger className="w-[180px] bg-card border-border h-10 shadow-sm text-[14px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
