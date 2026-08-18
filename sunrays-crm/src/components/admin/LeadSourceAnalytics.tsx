import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { cn, animations } from '../../lib/utils';
import { mockLeadSources } from '../../mock/leadAnalytics';

export const LeadSourceAnalytics: React.FC = () => {
  const [sortBy, setSortBy] = useState<'leads' | 'conversionRate' | 'revenue'>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...mockLeadSources].sort((a, b) => {
    const val = sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
    return val;
  });

  const maxLeads = Math.max(...mockLeadSources.map(s => s.leads));

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const formatRevenue = (v: number) => {
    if (v >= 1000000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  return (
    <div className="enterprise-card !p-0 overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground">Lead Source Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Performance by acquisition channel</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <button className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors" onClick={() => handleSort('leads')}>
                  Leads <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interested</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Converted</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <button className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors" onClick={() => handleSort('conversionRate')}>
                  Conv % <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <button className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors" onClick={() => handleSort('revenue')}>
                  Revenue <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">Volume</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((src, i) => (
              <motion.tr
                key={src.source}
                variants={animations.tableRow}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{src.icon}</span>
                    <div>
                      <p className="font-medium text-foreground text-[13px]">{src.source}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-foreground text-[13px]">{src.leads}</td>
                <td className="px-5 py-3.5 text-right text-muted-foreground text-[13px]">{src.interested}</td>
                <td className="px-5 py-3.5 text-right font-medium text-[13px]">
                  <span className="text-success font-semibold">{src.converted}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={cn(
                    'text-[13px] font-semibold px-2 py-0.5 rounded-md',
                    src.conversionRate >= 25 ? 'bg-success/10 text-success' :
                    src.conversionRate >= 18 ? 'bg-primary/10 text-primary' :
                    'bg-warning/10 text-warning'
                  )}>
                    {src.conversionRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-foreground text-[13px]">
                  {formatRevenue(src.revenue)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(src.leads / maxLeads) * 100}%`, backgroundColor: src.color }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground w-7 text-right">{Math.round((src.leads / maxLeads) * 100)}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
