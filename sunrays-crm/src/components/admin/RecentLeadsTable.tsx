import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { animations, cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Interested': 'bg-violet-50 text-violet-700 border-violet-200',
  'Meeting Scheduled': 'bg-orange-50 text-orange-700 border-orange-200',
  'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-200',
  'Negotiation': 'bg-red-50 text-red-700 border-red-200',
  'Converted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export interface RecentLeadsTableProps {
  leads: any[];
}

export const RecentLeadsTable: React.FC<RecentLeadsTableProps> = ({ leads }) => {
  const convertedLeads = leads.filter(lead => lead.status === 'Converted');

  return (
    <Card className="enterprise-card !p-0 overflow-hidden">
      <div className="p-5 border-b border-border bg-card">
        <h2 className="text-[17px] font-semibold text-foreground">Converted Leads</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Quick overview of converted clients</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned Employee</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Updated</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {convertedLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    No converted leads found for this period.
                  </td>
                </tr>
              )}
              {convertedLeads.map((lead, i) => (
                <motion.tr
                key={lead.id}
                variants={animations.tableRow}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-foreground text-[13px]">{lead.client}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-muted-foreground text-[13px]">{lead.company}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.avatar}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {lead.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] text-foreground font-medium">{lead.assignedTo}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn(
                    'text-[11px] font-medium px-2 py-0.5 rounded-md border',
                    STATUS_COLORS[lead.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                  )}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] text-muted-foreground">
                    {format(lead.updated, 'MMM d, h:mm a')}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
};
