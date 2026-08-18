import { DashboardActivity, DashboardStats } from '../types';
import { subHours, subDays } from 'date-fns';

const today = new Date();

export const mockDashboardStats: DashboardStats = {
  assignedLeads: { count: 142, percentage: 12.5, trend: 'up' },
  callsCompleted: { count: 28, percentage: 5.2, trend: 'up' },
  pendingFollowUps: { count: 15, percentage: 2.1, trend: 'down' },
  overdueFollowUps: { count: 3, percentage: 1.5, trend: 'down' },
  interestedLeads: { count: 45, percentage: 8.4, trend: 'up' },
  conversionRate: { count: 24, percentage: 4.2, trend: 'up' },
};

export const mockDashboardActivities: DashboardActivity[] = [
  {
    id: 'act-001',
    employeeId: 'usr-emp-1',
    clientId: 'cli-004',
    type: 'Status Updated',
    description: 'Updated status to Follow Up Scheduled',
    timestamp: subHours(today, 1).toISOString(),
  },
  {
    id: 'act-002',
    employeeId: 'usr-emp-1',
    clientId: 'cli-012',
    type: 'Lead Converted',
    description: 'Successfully closed the deal',
    timestamp: subHours(today, 3).toISOString(),
  },
  {
    id: 'act-003',
    employeeId: 'usr-emp-1',
    clientId: 'cli-002',
    type: 'Meeting Scheduled',
    description: 'Scheduled demo for executive team',
    timestamp: subHours(today, 5).toISOString(),
  },
  {
    id: 'act-004',
    employeeId: 'usr-emp-1',
    clientId: 'cli-001',
    type: 'Client Contacted',
    description: 'Called to discuss pricing',
    timestamp: subHours(today, 8).toISOString(),
  },
  {
    id: 'act-005',
    employeeId: 'usr-emp-1',
    clientId: 'cli-018',
    type: 'Lead Assigned',
    description: 'New lead assigned by Admin',
    timestamp: subDays(today, 1).toISOString(),
  },
  {
    id: 'act-006',
    employeeId: 'usr-emp-1',
    clientId: 'cli-007',
    type: 'Lead Rejected',
    description: 'Lead went with a competitor',
    timestamp: subDays(today, 1).toISOString(),
  },
  {
    id: 'act-007',
    employeeId: 'usr-emp-1',
    clientId: 'cli-015',
    type: 'Follow Up Completed',
    description: 'Sent proposal via email',
    timestamp: subDays(today, 2).toISOString(),
  }
];

// Added for charts
export const mockWeeklyCalls = [
  { day: 'Mon', calls: 15 },
  { day: 'Tue', calls: 28 },
  { day: 'Wed', calls: 34 },
  { day: 'Thu', calls: 22 },
  { day: 'Fri', calls: 45 },
  { day: 'Sat', calls: 12 },
  { day: 'Sun', calls: 5 },
];

export const mockLeadDistribution = [
  { name: 'Interested', value: 35, color: '#10b981' }, // Emerald
  { name: 'Meeting', value: 20, color: '#3b82f6' }, // Blue
  { name: 'Follow Up', value: 25, color: '#f59e0b' }, // Amber
  { name: 'New', value: 10, color: '#6366f1' }, // Indigo
  { name: 'Rejected', value: 10, color: '#ef4444' }, // Red
];

export const mockMonthlyConversions = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 22 },
  { month: 'Jun', count: 30 },
];
