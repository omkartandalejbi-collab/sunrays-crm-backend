import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';

export interface ExecutiveKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: {
    value: number;
    isPositive: boolean;
  };
  subtitle: string;
  sparklineData: any[];
}

export const ExecutiveKPICard: React.FC<ExecutiveKPICardProps> = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <Card className="enterprise-card p-4 group hover:shadow-soft-hover transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
