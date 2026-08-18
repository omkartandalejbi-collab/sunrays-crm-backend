import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Phone, Calendar, CheckCircle2, Clock, Eye } from 'lucide-react';
import { Client, FollowUp } from '../../types';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

export interface FollowUpCardProps {
  followUp: FollowUp;
  client: Client;
  onCall: (client: Client) => void;
  onComplete: (followUp: FollowUp) => void;
  onReschedule: (followUp: FollowUp) => void;
  onView: (client: Client) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUp,
  client,
  onCall,
  onComplete,
  onReschedule,
  onView
}) => {
  const isOverdue = new Date(followUp.scheduledDate) < new Date(new Date().setHours(0,0,0,0));

  return (
    <Card className={cn(
      "enterprise-card !p-0 overflow-hidden cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group", 
      isOverdue ? "border-danger/40" : ""
    )}>
      <CardContent className="p-4 flex flex-col gap-3">
        
        {/* Header: Priority & Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              client.priority === 'High' ? "bg-danger" :
              client.priority === 'Medium' ? "bg-warning" : "bg-muted-foreground"
            )} />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              {followUp.type}
            </span>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="bg-danger/10 text-danger border-none px-1.5 py-0 text-[10px] uppercase">
              Overdue
            </Badge>
          )}
        </div>

        {/* Client Info */}
        <div>
          <h4 className="font-bold text-[15px] text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => onView(client)}>
            {client.name}
          </h4>
          <p className="text-[13px] text-muted-foreground truncate">{client.company}</p>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground bg-muted/50 p-2 rounded-[8px]">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{format(parseISO(followUp.scheduledDate), 'MMM d')}</span>
          <span className="text-muted-foreground">•</span>
          <span>{followUp.scheduledTime}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => onCall(client)} title="Call Client" className="h-8 w-8 rounded-full text-success hover:bg-success/10 hover:text-success">
              <Phone className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost" onClick={() => onComplete(followUp)} title="Mark Complete" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10 hover:text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => onView(client)} title="View Details" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted">
              <Eye className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost" onClick={() => onReschedule(followUp)} title="Reschedule" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
