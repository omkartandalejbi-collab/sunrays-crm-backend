import React from 'react';
import { Bell, Check, Users, Calendar, Clock, Trophy, Info, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Notification, NotificationCategory } from '../../types';
import { formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (id: string) => void;
}

const getCategoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'Lead': return <Users className="h-4 w-4 text-blue-500" />;
    case 'Meeting': return <Calendar className="h-4 w-4 text-violet-500" />;
    case 'Follow Up': return <Clock className="h-4 w-4 text-amber-500" />;
    case 'Reminder': return <Bell className="h-4 w-4 text-slate-500" />;
    case 'System': return <Trophy className="h-4 w-4 text-emerald-500" />;
    default: return <Info className="h-4 w-4 text-primary" />;
  }
};

const getCategoryColor = (category: NotificationCategory) => {
  switch (category) {
    case 'Lead': return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/50";
    case 'Meeting': return "bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-900/50";
    case 'Follow Up': return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/50";
    case 'Reminder': return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    case 'System': return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900/50";
    default: return "bg-primary/10 border-primary/20";
  }
};

const getDateGroup = (dateString: string) => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return 'Earlier';
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const group = getDateGroup(notification.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-full hover:bg-muted/50 transition-colors inline-flex items-center justify-center h-10 w-10">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[380px] p-0 overflow-hidden rounded-xl border-border/50 shadow-2xl" align="end" sideOffset={8}>
        <div className="bg-muted/30 border-b p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <DropdownMenuLabel className="p-0 font-bold text-base">Notifications</DropdownMenuLabel>
              <p className="text-xs text-muted-foreground mt-0.5">You have {unreadCount} unread messages</p>
            </div>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="icon" onClick={onMarkAllAsRead} className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-full" title="Mark all as read">
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full" title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[420px]">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs mt-1">Check back later for new notifications.</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {groupOrder.map(group => {
                const groupNotifs = groupedNotifications[group];
                if (!groupNotifs || groupNotifs.length === 0) return null;
                
                return (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                    <DropdownMenuGroup className="space-y-1">
                      {groupNotifs.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-3 p-3 cursor-pointer rounded-xl transition-all outline-none",
                            !notification.isRead ? "bg-primary/5 hover:bg-primary/10 data-[highlighted]:bg-primary/10" : "hover:bg-muted/50 data-[highlighted]:bg-muted/50"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            onNotificationClick(notification.id);
                          }}
                        >
                          <div className={cn("mt-0.5 shrink-0 rounded-full p-2 border shadow-sm", getCategoryColor(notification.category))}>
                            {getCategoryIcon(notification.category)}
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full relative">
                            <div className="flex items-start justify-between gap-2 pr-4">
                              <p className={cn("text-sm leading-tight", !notification.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="absolute right-0 top-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 pr-4">
                              {notification.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium mt-1">
                              {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/10">
            <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary hover:bg-primary/10 font-semibold">
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
