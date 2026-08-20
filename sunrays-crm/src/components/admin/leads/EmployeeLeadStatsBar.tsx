import React from 'react';
import { Users, UserX, Sparkles, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { LeadStats } from '../../../types';
import { cn } from '../../../lib/utils';

interface EmployeeLeadStatsBarProps {
  stats: LeadStats | null;
  selectedEmployeeId: string;
  onSelectEmployee: (empId: string) => void;
  onBulkAssign?: () => void;
  isBulkAssigning?: boolean;
}

export const EmployeeLeadStatsBar: React.FC<EmployeeLeadStatsBarProps> = ({
  stats,
  selectedEmployeeId,
  onSelectEmployee,
  onBulkAssign,
  isBulkAssigning = false,
}) => {
  if (!stats) return null;

  const employees = stats.employeeLeadCounts || [];
  const unassignedCount = stats.unassignedLeads || 0;

  return (
    <div className="space-y-3">
      {/* Top summary chips and action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectEmployee('all')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm',
              selectedEmployeeId === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:bg-muted/70'
            )}
          >
            <Users size={14} />
            <span>All Leads</span>
            <Badge
              variant={selectedEmployeeId === 'all' ? 'secondary' : 'outline'}
              className="ml-1 px-1.5 py-0 text-[11px] h-4 min-w-4"
            >
              {stats.totalLeads}
            </Badge>
          </button>

          <button
            onClick={() => onSelectEmployee('unassigned')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm',
              selectedEmployeeId === 'unassigned'
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : unassignedCount > 0
                ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/70'
            )}
          >
            <UserX size={14} />
            <span>Unassigned</span>
            <Badge
              variant={selectedEmployeeId === 'unassigned' ? 'secondary' : 'outline'}
              className={cn(
                'ml-1 px-1.5 py-0 text-[11px] h-4 min-w-4',
                unassignedCount > 0 && selectedEmployeeId !== 'unassigned' && 'bg-destructive/20 text-destructive border-destructive/30'
              )}
            >
              {unassignedCount}
            </Badge>
          </button>
        </div>

        {unassignedCount > 0 && onBulkAssign && (
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkAssign}
            disabled={isBulkAssigning}
            className="h-8 gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 bg-primary/5"
          >
            {isBulkAssigning ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            Auto-Distribute {unassignedCount} Leads
          </Button>
        )}
      </div>

      {/* Employee-wise assignment cards carousel / scroll */}
      {employees.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin pt-1">
          {employees.map((emp) => {
            const isSelected = selectedEmployeeId === emp.employeeId;
            const isActive = emp.status === 'Active' && emp.isAccessEnabled;

            return (
              <div
                key={emp.employeeId}
                onClick={() => onSelectEmployee(isSelected ? 'all' : emp.employeeId)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-card cursor-pointer shrink-0 transition-all select-none',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40 shadow-xs'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={emp.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                      isActive ? 'bg-success' : 'bg-muted-foreground'
                    )}
                    title={isActive ? 'Active (Eligible for leads)' : `${emp.status} (Excluded from leads)`}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-foreground truncate max-w-[110px]">
                      {emp.name}
                    </span>
                    {!isActive && (
                      <span className="text-[9px] px-1 py-0 rounded bg-muted text-muted-foreground font-medium">
                        {emp.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>
                      <strong className="text-foreground font-semibold">{emp.assignedCount}</strong> leads
                    </span>
                    {emp.convertedCount > 0 && (
                      <span>
                        • <span className="text-success font-medium">{emp.convertedCount} conv</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
