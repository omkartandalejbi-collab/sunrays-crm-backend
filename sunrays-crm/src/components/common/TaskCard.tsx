import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Phone, Clock, Building, MapPin } from 'lucide-react';
import { Client, LeadStatus, Priority } from '../../types';
import { cn } from '../../lib/utils';

export interface TaskCardProps {
  client: Client;
  type: 'call' | 'followup' | 'meeting';
  scheduledTime?: string;
  onCall?: (client: Client) => void;
  onView?: (client: Client) => void;
  onUpdate?: (client: Client) => void;
  showLocationInsteadOfCompany?: boolean;
  className?: string;
}

export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'High': return 'destructive'; // Red
    case 'Medium': return 'warning'; // We'll map this to amber in globals
    case 'Low': return 'secondary'; // Slate
    default: return 'outline';
  }
};

export const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'New': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200';
    case 'Assigned': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    case 'Contacted': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200';
    case 'Interested': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
    case 'Follow Up Scheduled': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
    case 'Meeting Scheduled': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200';
    case 'Converted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
    case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
    case 'Busy':
    case 'Call Later':
    case 'No Response': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  client,
  scheduledTime,
  onCall,
  onView,
  onUpdate,
  showLocationInsteadOfCompany,
  className
}) => {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group", className)}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Priority indicator strip */}
          <div className={cn(
            "w-full sm:w-1.5 h-1.5 sm:h-auto shrink-0",
            client.priority === 'High' ? "bg-destructive" :
            client.priority === 'Medium' ? "bg-amber-500" : "bg-slate-300"
          )} />
          
          <div className="flex-1 p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-base">{client.name}</h4>
                  <Badge variant="outline" className={cn("text-xs font-medium border", getStatusColor(client.status))}>
                    {client.status}
                  </Badge>
                  {client.priority === 'High' && (
                    <Badge variant="destructive" className="text-[10px] uppercase tracking-wider px-1.5 py-0">High Priority</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {showLocationInsteadOfCompany ? (
                      <>
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{client.location}</span>
                      </>
                    ) : (
                      <>
                        <Building className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{client.company}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  {scheduledTime && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{scheduledTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0 justify-end w-full sm:w-auto mt-2 sm:mt-0">
                {onCall && (
                  <Button size="sm" onClick={() => onCall(client)} className="flex-1 sm:flex-none">
                    <Phone className="mr-2 h-3.5 w-3.5" /> Call
                  </Button>
                )}
                <div className="flex gap-2 flex-1 sm:flex-none">
                  {onView && (
                    <Button size="sm" variant="outline" onClick={() => onView(client)} className="flex-1 sm:flex-none">
                      View
                    </Button>
                  )}
                  {onUpdate && (
                    <Button size="sm" variant="secondary" onClick={() => onUpdate(client)} className="flex-1 sm:flex-none">
                      Update
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
