import React from 'react';
import { motion } from 'framer-motion';
import { cn, animations } from '../../lib/utils';
import { mockQuickInsights } from '../../mock/businessMetrics';
import { TrendingUp, Star, AlertTriangle } from 'lucide-react';

const ICON_MAP = {
  positive: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10 border-success/20' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  star: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-success',
};

export const QuickInsights: React.FC = () => {
  return (
    <div className="enterprise-card h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-[17px] font-semibold text-foreground">Quick Insights</h2>
        </div>
        <p className="text-sm text-muted-foreground">AI-powered business intelligence</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {mockQuickInsights.map((insight, i) => {
          const config = ICON_MAP[insight.type] || ICON_MAP.positive;
          const IconComp = config.icon;
          return (
            <motion.div
              key={insight.id}
              variants={animations.slideRight}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200 cursor-default group"
            >
              <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
                <IconComp className={cn('w-4 h-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground leading-snug">{insight.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[insight.priority])} />
                  <span className="text-[11px] text-muted-foreground capitalize">{insight.priority} priority</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{insight.time}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
