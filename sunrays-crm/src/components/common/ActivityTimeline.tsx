import React from 'react';
import { DashboardActivity } from '../../types';
import { format, parseISO } from 'date-fns';

export interface ActivityTimelineProps {
  activities: DashboardActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border p-4">
      {activities.map((activity) => (
        <div key={activity.id} className="relative z-10">
          <div className="absolute -left-[35px] mt-1.5">
            <div className="flex items-center justify-center h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <p className="text-sm font-semibold">{activity.type}</p>
            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{format(parseISO(activity.timestamp), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
