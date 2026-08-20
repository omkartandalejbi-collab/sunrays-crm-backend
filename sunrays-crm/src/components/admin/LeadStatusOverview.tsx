import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn, animations } from '../../lib/utils';
import { mockLeadStatusCounts } from '../../mock/adminDashboard';

export const LeadStatusOverview: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground">Lead Status Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Company-wide distribution across all stages</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockLeadStatusCounts.map((item, i) => (
          <motion.div
            key={item.status}
            variants={animations.scaleUp}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="enterprise-card !p-4 cursor-pointer group hover:border-primary/30 hover:shadow-soft-hover transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className={cn(
                'flex items-center text-[11px] font-semibold gap-0.5',
                item.isPositive ? 'text-success' : 'text-red-500'
              )}>
                {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.isPositive ? '+' : '-'}{item.trend}%
              </div>
            </div>

            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {item.status}
            </p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">
              {item.count}
            </p>
            <p className="text-[11px] text-muted-foreground mb-3">
              {item.percentage}% of total
            </p>

            <div className="h-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.sparkline.map(v => ({ value: v }))}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={item.color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
