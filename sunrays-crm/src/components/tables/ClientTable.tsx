import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Edit2 } from 'lucide-react';
import { Client } from '../../types';
import { format, parseISO } from 'date-fns';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { Users } from 'lucide-react';

export interface ClientTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onUpdate: (client: Client) => void;
  showEmployee?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({ clients, onView, onUpdate, showEmployee = false }) => {
  return (
    <div className="rounded-[16px] bg-card border border-border overflow-hidden relative shadow-sm">
      <div className="overflow-auto max-h-[600px] scrollbar-thin">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-20">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[300px] sticky left-0 z-30 bg-background shadow-[1px_0_0_0_hsl(var(--border))] text-small-label text-muted-foreground h-11">Client</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Contact</TableHead>
              {showEmployee && <TableHead className="text-small-label text-muted-foreground h-11">Assigned Employee</TableHead>}
              <TableHead className="text-small-label text-muted-foreground h-11">Status</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Last Contact</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Next Follow Up</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11 w-[200px]">Latest Remark</TableHead>
              <TableHead className="text-right pr-6 text-small-label text-muted-foreground h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showEmployee ? 8 : 7} className="h-[400px]">
                  <EmptyState 
                    icon={Users}
                    title="No clients found"
                    description="There are no clients matching your current filters."
                  />
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow 
                  key={client.id} 
                  onClick={() => onView(client)}
                  className="group hover:bg-blue-50/50 hover:shadow-sm active:scale-[0.998] transition-all duration-200 cursor-pointer border-b border-border"
                >
                  <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-blue-50/50 transition-colors shadow-[1px_0_0_0_hsl(var(--border))] py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary text-[12px] font-semibold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px] text-foreground">{client.name}</span>
                        <span className="text-[13px] text-muted-foreground truncate max-w-[200px]">{client.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-foreground">{client.phone}</span>
                      <span className="text-[13px] text-muted-foreground truncate max-w-[180px]">{client.email}</span>
                    </div>
                  </TableCell>
                  {showEmployee && (
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {(client.interactionHistory?.[0]?.employee || 'Jane Doe').split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] font-medium text-foreground">{client.interactionHistory?.[0]?.employee || 'Jane Doe'}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="py-3">
                    <StatusBadge status={client.status as any} />
                  </TableCell>
                  <TableCell className="text-[14px] text-muted-foreground py-3 font-medium">
                    {client.lastContactDate ? format(parseISO(client.lastContactDate), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-[14px] py-3">
                    {client.nextFollowUpDate ? (
                      <div className="flex flex-col">
                        <span className="text-foreground font-semibold">{format(parseISO(client.nextFollowUpDate), 'MMM d, yyyy')}</span>
                        <span className="text-[12px] text-muted-foreground font-medium">{client.nextFollowUpTime}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="py-3">
                    <span 
                      className="block truncate max-w-[200px] text-[13px] text-muted-foreground"
                      title={client.interactionHistory?.[0]?.remark || client.notes || '-'}
                    >
                      {client.interactionHistory?.[0]?.remark || client.notes || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(client);
                        }} 
                        title="Update Status" 
                        className="h-8 w-8 rounded-full text-primary hover:text-primary bg-white hover:bg-primary/10 border border-border shadow-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
