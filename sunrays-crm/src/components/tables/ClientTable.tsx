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
import { Badge } from '../ui/badge';
import { Edit2, UserCheck, Users } from 'lucide-react';
import { Client } from '../../types';
import { format, parseISO } from 'date-fns';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export interface ClientTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onUpdate: (client: Client) => void;
  onAssign?: (client: Client) => void;
  showEmployee?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onView,
  onUpdate,
  onAssign,
  showEmployee = false,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-[16px] bg-card border border-border overflow-hidden relative shadow-sm">
      <div className="overflow-auto max-h-[650px] scrollbar-thin">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-20 shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[280px] sticky left-0 z-30 bg-background shadow-[1px_0_0_0_hsl(var(--border))] text-small-label text-muted-foreground h-11">
                Lead / Contact
              </TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Contact Info</TableHead>
              {showEmployee && (
                <TableHead className="text-small-label text-muted-foreground h-11">
                  Assigned Employee
                </TableHead>
              )}
              <TableHead className="text-small-label text-muted-foreground h-11">Status</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Assignment</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11">Next Follow Up</TableHead>
              <TableHead className="text-small-label text-muted-foreground h-11 w-[200px]">Latest Remark</TableHead>
              <TableHead className="text-right pr-6 text-small-label text-muted-foreground h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showEmployee ? 8 : 7} className="h-[400px]">
                  <EmptyState
                    icon={Users}
                    title="No leads found"
                    description="There are no leads matching your current filters."
                  />
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                const assignedName =
                  client.assignedEmployeeName ||
                  client.interactionHistory?.[0]?.employee ||
                  '';
                const isAssigned =
                  client.assignmentStatus === 'Assigned' || (client.assignedTo && client.assignedTo !== '');

                return (
                  <TableRow
                    key={client.id}
                    onClick={() => onView(client)}
                    className="group hover:bg-blue-50/50 hover:shadow-sm active:scale-[0.998] transition-all duration-200 cursor-pointer border-b border-border"
                  >
                    {/* Name & Location / Company */}
                    <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-blue-50/50 transition-colors shadow-[1px_0_0_0_hsl(var(--border))] py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-[12px] font-semibold">
                            {client.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[14px] text-foreground truncate">
                            {client.name}
                          </span>
                          <span className="text-[12px] text-muted-foreground truncate max-w-[200px]">
                            {client.company || client.location || 'Individual'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Phone & Email */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">{client.phone || '-'}</span>
                        <span className="text-[12px] text-muted-foreground truncate max-w-[180px]">
                          {client.email || '-'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Assigned Employee (for Admin view) */}
                    {showEmployee && (
                      <TableCell className="py-3">
                        {isAssigned && assignedName ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-border">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                {assignedName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-medium text-foreground truncate max-w-[140px]">
                              {assignedName}
                            </span>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-semibold"
                          >
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                    )}

                    {/* Status Badge */}
                    <TableCell className="py-3">
                      <StatusBadge status={client.status as any} />
                    </TableCell>

                    {/* Assignment Status Pill */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={
                          isAssigned
                            ? 'bg-success/10 text-success border-success/20 text-[11px] font-semibold'
                            : 'bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-semibold'
                        }
                      >
                        {isAssigned ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </TableCell>

                    {/* Next Follow Up */}
                    <TableCell className="text-[13px] py-3">
                      {client.nextFollowUpDate ? (
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">
                            {formatDate(client.nextFollowUpDate)}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {client.nextFollowUpTime || '10:00 AM'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Latest Remark */}
                    <TableCell className="py-3">
                      <span
                        className="block truncate max-w-[200px] text-[13px] text-muted-foreground"
                        title={client.interactionHistory?.[0]?.remark || client.notes || '-'}
                      >
                        {client.interactionHistory?.[0]?.remark || client.notes || '-'}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {onAssign && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssign(client);
                            }}
                            title="Assign Lead"
                            className="h-8 w-8 rounded-full text-foreground hover:text-primary bg-background hover:bg-primary/10 border border-border shadow-sm"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(client);
                          }}
                          title="Update Status"
                          className="h-8 w-8 rounded-full text-primary hover:text-primary bg-background hover:bg-primary/10 border border-border shadow-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
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
