import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn, animations } from '../../lib/utils';
import { mockUpcomingMeetings } from '../../mock/meetingOverview';
import { Calendar, Clock } from 'lucide-react';

const MEETING_TYPE_COLORS: Record<string, string> = {
  Demo: 'bg-blue-50 text-blue-700 border-blue-200',
  Discovery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Proposal: 'bg-violet-50 text-violet-700 border-violet-200',
  Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
  Closing: 'bg-green-50 text-green-700 border-green-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const STATUS_COLORS: Record<string, string> = {
  Confirmed: 'text-success',
  Scheduled: 'text-primary',
  'Pending Confirmation': 'text-warning',
};

export const MeetingOverview: React.FC = () => {
  return (
    <div className="enterprise-card !p-0 overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground">Upcoming Team Meetings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Next 5 scheduled client meetings</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(), 'MMM d, yyyy')}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUpcomingMeetings.map((mtg, i) => {
              const meetingDate = parseISO(mtg.meetingTime);
              const timeStr = isToday(meetingDate)
                ? `Today ${format(meetingDate, 'h:mm a')}`
                : format(meetingDate, 'MMM d, h:mm a');

              return (
                <motion.tr
                  key={mtg.id}
                  variants={animations.tableRow}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-foreground text-[13px]">{mtg.clientName}</p>
                      <p className="text-xs text-muted-foreground">{mtg.company}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mtg.employeeAvatar}`} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                          {mtg.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] text-foreground">{mtg.employeeName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[13px] text-foreground">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {timeStr}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-md border',
                      MEETING_TYPE_COLORS[mtg.meetingType]
                    )}>
                      {mtg.meetingType}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-md border',
                      PRIORITY_COLORS[mtg.priority]
                    )}>
                      {mtg.priority}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={cn('text-[12px] font-semibold', STATUS_COLORS[mtg.status])}>
                      {mtg.status}
                    </span>
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
