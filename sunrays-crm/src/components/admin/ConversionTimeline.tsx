import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { animations } from '../../lib/utils';
import { mockConversionTimeline } from '../../mock/conversionTimeline';
import { CheckCircle2, Building, Calendar } from 'lucide-react';

const formatTime = (iso: string) => {
  const date = parseISO(iso);
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
};

const formatValue = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

export const ConversionTimeline: React.FC = () => {
  return (
    <div className="enterprise-card !p-0 overflow-hidden h-full">
      <div className="p-5 border-b border-border bg-card">
        <h2 className="text-[17px] font-semibold text-foreground">Recent Conversions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Latest successful business outcomes</p>
      </div>

      <div className="divide-y divide-border/50 overflow-y-auto max-h-[520px]">
        {mockConversionTimeline.map((item, i) => (
          <motion.div
            key={item.id}
            variants={animations.slideRight}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
            className="p-4 hover:bg-muted/20 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 mt-0.5">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-success/10 text-success font-semibold text-xs">
                    {item.clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground text-[13px] truncate">{item.clientName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Building className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.company}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-success">{formatValue(item.dealValue)}</p>
                    <p className="text-[10px] text-muted-foreground">{item.daysToConvert}d cycle</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-border shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.employeeAvatar}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                        {item.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-muted-foreground">{item.employeeName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{item.leadSource}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatTime(item.convertedAt)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
