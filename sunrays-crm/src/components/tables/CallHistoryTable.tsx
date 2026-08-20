import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { CallHistory, Client } from '../../types';
import { format, parseISO } from 'date-fns';
import { Clock, Phone, PhoneOff, PhoneForwarded } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';

export interface CallHistoryTableProps {
  history: CallHistory[];
  clients: Client[];
}

export const CallHistoryTable: React.FC<CallHistoryTableProps> = ({ history, clients }) => {
  
  const getClient = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <div className="rounded-[16px] bg-card border border-border overflow-hidden relative shadow-sm">
      <div className="overflow-auto max-h-[600px] scrollbar-thin">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-20">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[180px] text-small-label text-muted-foreground h-11">Date & Time</TableHead>
              <TableHead className="w-[300px] sticky left-0 z-30 bg-background shadow-[1px_0_0_0_hsl(var(--border))] text-small-label text-muted-foreground h-11">Client</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Duration</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Status</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-[300px]">
                  <EmptyState 
                    icon={Clock}
                    title="No call history"
                    description="You haven't made any calls matching these filters."
                  />
                </TableCell>
              </TableRow>
            ) : (
              history.map((call) => {
                const client = getClient(call.clientId);
                const clientName = client ? client.name : 'Unknown Client';
                const clientCompany = client ? client.company : '';
                
                return (
                  <TableRow key={call.id} className="group hover:bg-muted/50 transition-colors border-b border-border">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px] text-foreground">{format(parseISO(call.createdAt), 'MMM d, yyyy')}</span>
                        <span className="text-[12px] text-muted-foreground font-medium">{format(parseISO(call.createdAt), 'h:mm a')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 transition-colors shadow-[1px_0_0_0_hsl(var(--border))] py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-[12px] font-semibold">
                            {clientName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[14px] text-foreground">{clientName}</span>
                          <span className="text-[13px] text-muted-foreground truncate max-w-[200px]">{clientCompany}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{call.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={cn(
                        "font-medium gap-1.5 px-2.5 py-1 border rounded-md shadow-sm",
                        call.status === 'Answered' ? 'bg-success/10 text-success border-success/20' :
                        call.status === 'Missed' ? 'bg-danger/10 text-danger border-danger/20' :
                        call.status === 'Busy' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-muted text-muted-foreground border-border'
                      )}>
                        {call.status === 'Answered' && <Phone className="h-3 w-3" />}
                        {call.status === 'Missed' && <PhoneOff className="h-3 w-3" />}
                        {call.status === 'Busy' && <PhoneForwarded className="h-3 w-3" />}
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] py-3">
                      <p className="text-[14px] truncate text-muted-foreground" title={call.remark}>{call.remark}</p>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
