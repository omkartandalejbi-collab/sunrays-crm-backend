import React from 'react';
import { Card } from '../ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className,
}) => {
  const trendColor = trend.isPositive ? 'text-success' : 'text-danger';

  return (
    <div className={className}>
      <Card className="enterprise-card h-full flex flex-col justify-between overflow-hidden relative group p-4">
        <div className="flex justify-between items-start mb-2">
          <p className="text-small-label">{title}</p>
          <div className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[28px] font-bold tracking-tight text-foreground">{value}</h3>
            {trend && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex items-center text-xs font-semibold", trendColor)}
              >
                {trend.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">
              {subtitle || "vs last period"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
