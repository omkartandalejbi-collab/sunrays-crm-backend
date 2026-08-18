import React from 'react';
import { Badge } from '../ui/badge';
import { LeadStatus } from '../../types';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, Calendar, XCircle, Phone, UserCheck, PhoneOff, PhoneForwarded, CircleDot, UserCog } from 'lucide-react';

export interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  showIcon?: boolean;
}

export const statusConfig: Record<LeadStatus, { color: string; label: string; icon: React.ElementType }> = {
  Converted: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', label: 'Converted', icon: CheckCircle2 },
  Rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Rejected', icon: XCircle },
  Busy: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Busy', icon: PhoneOff },
  'Call Later': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Call Later', icon: Clock },
  'No Response': { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: 'No Response', icon: PhoneForwarded },
  New: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', label: 'New Lead', icon: CircleDot },
  Assigned: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', label: 'Assigned', icon: UserCog },
  Interested: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Interested', icon: UserCheck },
  Contacted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Contacted', icon: Phone },
  'Follow Up Scheduled': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'Follow Up', icon: Clock },
  'Meeting Scheduled': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', label: 'Meeting', icon: Calendar },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.New;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("font-medium gap-1.5 px-2.5 py-0.5", config.color, className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </Badge>
  );
};
