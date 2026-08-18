import React from 'react';
import { Badge } from '../ui/badge';
import { Priority } from '../../types';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

export const priorityConfig: Record<Priority, { color: string; label: string; icon: React.ElementType }> = {
  High: { color: 'bg-danger/10 text-danger border-danger/20', label: 'High Priority', icon: ArrowUpRight },
  Medium: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Medium Priority', icon: ArrowRight },
  Low: { color: 'bg-muted text-muted-foreground border-border', label: 'Low Priority', icon: ArrowDownRight },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className, showIcon = true }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("font-medium gap-1.5 px-2.5 py-0.5", config.color, className)}>
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};
