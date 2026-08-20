import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn, animations } from '../../lib/utils';
import { mockEmployeePerformance } from '../../mock/employeePerformance';
import { Button } from '../ui/button';

const RANK_CONFIG = [
  { label: '🥇', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  { label: '🥈', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600' },
  { label: '🥉', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  { label: '4', bg: 'bg-muted border-border', text: 'text-muted-foreground' },
  { label: '5', bg: 'bg-muted border-border', text: 'text-muted-foreground' },
];

export const EmployeeLeaderboard: React.FC = () => {
  return (
    <div className="enterprise-card !p-0 overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground">Employee Performance Leaderboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Top 5 performers this month by conversion rate</p>
        </div>
        <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5 text-xs h-8">
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14">Rank</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leads</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calls</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meetings</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interested</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Converted</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conv %</th>
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">Score</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockEmployeePerformance.map((emp, i) => {
              const rank = RANK_CONFIG[i];
              return (
                <motion.tr
                  key={emp.id}
                  variants={animations.tableRow}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.06 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className={cn(
                      'w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold',
                      rank.bg, rank.text
                    )}>
                      {rank.label}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.avatarSeed}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-[13px]">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right text-[13px] font-medium text-foreground">{emp.assignedLeads}</td>
                  <td className="px-4 py-4 text-right text-[13px] text-muted-foreground">{emp.calls}</td>
                  <td className="px-4 py-4 text-right text-[13px] text-muted-foreground">{emp.meetings}</td>
                  <td className="px-4 py-4 text-right text-[13px] text-muted-foreground">{emp.interested}</td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-success font-semibold text-[13px]">{emp.converted}</span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span className={cn(
                      'text-[13px] font-semibold px-2 py-0.5 rounded-md',
                      emp.conversionRate >= 25 ? 'bg-success/10 text-success' :
                      emp.conversionRate >= 20 ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    )}>
                      {emp.conversionRate.toFixed(1)}%
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-muted-foreground">Score</span>
                        <span className="text-[11px] font-semibold text-foreground">{emp.performanceScore}/100</span>
                      </div>
                      <div className="bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${emp.performanceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {emp.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : emp.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
