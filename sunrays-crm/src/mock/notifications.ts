import { Notification, NotificationCategory } from '../types';
import { subHours } from 'date-fns';

const today = new Date();

const generateNotifications = (): Notification[] => {
  const notifications: Notification[] = [];
  
  const templates = [
    { title: 'New Lead Assigned', message: 'Admin has assigned a new lead: Tech Mahindra.', category: 'Lead' as NotificationCategory },
    { title: 'Follow Up Due', message: 'You have a follow up call with Infosys in 15 mins.', category: 'Follow Up' as NotificationCategory },
    { title: 'Meeting Reminder', message: 'Demo scheduled with TCS at 2:00 PM.', category: 'Meeting' as NotificationCategory },
    { title: 'Lead Converted', message: 'Congratulations! Mahindra deal was successfully closed.', category: 'System' as NotificationCategory },
    { title: 'Daily Report', message: 'Your daily performance report is ready to view.', category: 'Reminder' as NotificationCategory },
  ];

  for (let i = 0; i < 20; i++) {
    const template = templates[i % templates.length];
    notifications.push({
      id: `notif-${i + 1}`,
      userId: 'usr-emp-1',
      title: template.title,
      message: template.message,
      category: template.category,
      isRead: i > 4, // First 5 are unread
      createdAt: subHours(today, i * 2).toISOString(),
    });
  }

  return notifications;
};

export const mockNotifications = generateNotifications();
