import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';
import { cn, animations } from '../../lib/utils';
import { mockBusinessMetrics } from '../../mock/businessMetrics';
import { DollarSign, CheckCircle, Clock, BarChart2 } from 'lucide-react';

const METRIC_ICONS = [DollarSign, CheckCircle, Clock, BarChart2];
const METRIC_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export const BusinessMetricsRow: React.FC = () => {
  const metrics = [
    { key: 'revenue', label: 'Revenue This Month', ...mockBusinessMetrics.revenue },
    { key: 'deals', label: 'Deals Closed', ...mockBusinessMetrics.dealsClosed },
    { key: 'response', label: 'Avg Response Time', ...mockBusinessMetrics.avgResponseTime },
    { key: 'cycle', label: 'Avg Sales Cycle', ...mockBusinessMetrics.avgSalesCycle },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric, i) => {
        const Icon = METRIC_ICONS[i];
        const color = METRIC_COLORS[i];
        return (
          <motion.div
            key={metric.key}
            variants={animations.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card className="enterprise-card h-full flex flex-col gap-3 group hover:border-primary/20 hover:shadow-soft-hover transition-all duration-200">
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className={cn(
                  'flex items-center text-[11px] font-semibold gap-0.5',
                  metric.isPositive ? 'text-success' : 'text-red-500'
                )}>
                  {metric.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.isPositive ? '+' : '-'}{metric.change}%
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{metric.label}</p>
                <p className="text-[26px] font-bold text-foreground leading-none">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
