import { addDays, addHours } from 'date-fns';

const today = new Date();

export interface MeetingData {
  id: string;
  clientName: string;
  company: string;
  employeeName: string;
  employeeAvatar: string;
  meetingTime: string;
  meetingType: 'Demo' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Closing';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Confirmed' | 'Pending Confirmation';
}

export const mockUpcomingMeetings: MeetingData[] = [
  {
    id: 'mtg-001',
    clientName: 'Priya Sharma',
    company: 'TCS Enterprise',
    employeeName: 'Rahul Sharma',
    employeeAvatar: 'Rahul',
    meetingTime: addHours(today, 2).toISOString(),
    meetingType: 'Demo',
    priority: 'High',
    status: 'Confirmed',
  },
  {
    id: 'mtg-002',
    clientName: 'Suresh Iyer',
    company: 'Hexaware Technologies',
    employeeName: 'Priya Mehta',
    employeeAvatar: 'Priya',
    meetingTime: addHours(today, 5).toISOString(),
    meetingType: 'Proposal',
    priority: 'High',
    status: 'Scheduled',
  },
  {
    id: 'mtg-003',
    clientName: 'Neha Kapoor',
    company: 'Mphasis Digital',
    employeeName: 'Arjun Nair',
    employeeAvatar: 'Arjun',
    meetingTime: addDays(today, 1).toISOString(),
    meetingType: 'Discovery',
    priority: 'Medium',
    status: 'Confirmed',
  },
  {
    id: 'mtg-004',
    clientName: 'Vivek Anand',
    company: 'Zensar Technologies',
    employeeName: 'Sneha Patil',
    employeeAvatar: 'Sneha',
    meetingTime: addDays(today, 1).toISOString(),
    meetingType: 'Negotiation',
    priority: 'High',
    status: 'Pending Confirmation',
  },
  {
    id: 'mtg-005',
    clientName: 'Lakshmi Rao',
    company: 'NIIT Technologies',
    employeeName: 'Rahul Sharma',
    employeeAvatar: 'Rahul',
    meetingTime: addDays(today, 2).toISOString(),
    meetingType: 'Closing',
    priority: 'High',
    status: 'Confirmed',
  },
];
