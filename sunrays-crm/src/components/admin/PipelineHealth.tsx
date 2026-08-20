import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../../lib/utils';
import { mockPipelineHealth } from '../../mock/leadAnalytics';
import { ArrowDown } from 'lucide-react';

export const PipelineHealth: React.FC = () => {
  return (
    <div className="enterprise-card h-full">
      <div className="mb-5">
        <h2 className="text-[17px] font-semibold text-foreground">Pipeline Health</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Lead progression across all stages</p>
      </div>

      <div className="space-y-1">
        {mockPipelineHealth.map((stage, i) => (
          <div key={stage.stage}>
            <motion.div
              variants={animations.slideRight}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.07 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-[13px] font-medium text-foreground">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{stage.percentage.toFixed(1)}%</span>
                  <span className="text-[13px] font-semibold text-foreground w-10 text-right">{stage.count}</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ delay: i * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
              </div>
            </motion.div>
            {i < mockPipelineHealth.length - 1 && (
              <div className="flex justify-center my-1">
                <ArrowDown className="w-3 h-3 text-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-success/5 border border-success/20">
            <p className="text-[20px] font-bold text-success">23.4%</p>
            <p className="text-[11px] text-muted-foreground">Win Rate</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-[20px] font-bold text-primary">18 days</p>
            <p className="text-[11px] text-muted-foreground">Avg Cycle</p>
          </div>
        </div>
      </div>
    </div>
  );
};
