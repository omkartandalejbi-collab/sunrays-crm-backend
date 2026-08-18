export type TrendType = 'up' | 'down';

export interface AdminStat {
  count: number;
  percentage: number;
  trend: TrendType;
}

export const mockAdminStats: Record<string, AdminStat> = {
  totalActiveLeads: { count: 847, percentage: 18.3, trend: 'up' },
  totalCalls: { count: 1284, percentage: 9.7, trend: 'up' },
  conversionRate: { count: 23.4, percentage: 4.2, trend: 'up' },
  openPipeline: { count: 312, percentage: 6.1, trend: 'down' },
};

export const mockAdminWeeklyCalls = [
  { day: 'Mon', calls: 142, meetings: 18 },
  { day: 'Tue', calls: 198, meetings: 24 },
  { day: 'Wed', calls: 221, meetings: 31 },
  { day: 'Thu', calls: 167, meetings: 22 },
  { day: 'Fri', calls: 289, meetings: 38 },
  { day: 'Sat', calls: 94, meetings: 12 },
  { day: 'Sun', calls: 43, meetings: 5 },
];

export const mockLeadStatusCounts = [
  {
    status: 'New',
    count: 142,
    percentage: 16.8,
    trend: 8.2,
    isPositive: true,
    color: '#6366f1',
    bgColor: '#ede9fe',
    sparkline: [40, 55, 48, 62, 71, 85, 142],
  },
  {
    status: 'Assigned',
    count: 203,
    percentage: 24.0,
    trend: 5.1,
    isPositive: true,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    sparkline: [120, 145, 162, 178, 190, 198, 203],
  },
  {
    status: 'Interested',
    count: 187,
    percentage: 22.1,
    trend: 12.4,
    isPositive: true,
    color: '#10b981',
    bgColor: '#d1fae5',
    sparkline: [80, 95, 110, 132, 158, 172, 187],
  },
  {
    status: 'Meeting Scheduled',
    count: 64,
    percentage: 7.6,
    trend: 3.8,
    isPositive: true,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    sparkline: [20, 28, 35, 42, 51, 58, 64],
  },
  {
    status: 'Converted',
    count: 198,
    percentage: 23.4,
    trend: 14.2,
    isPositive: true,
    color: '#16a34a',
    bgColor: '#dcfce7',
    sparkline: [80, 102, 128, 148, 165, 182, 198],
  },
  {
    status: 'Rejected',
    count: 53,
    percentage: 6.3,
    trend: 2.1,
    isPositive: false,
    color: '#ef4444',
    bgColor: '#fee2e2',
    sparkline: [48, 50, 51, 52, 52, 53, 53],
  },
];

export const mockAdminPipelineFunnel = [
  { name: 'Assigned', value: 847, fill: '#3b82f6' },
  { name: 'Contacted', value: 621, fill: '#6366f1' },
  { name: 'Interested', value: 387, fill: '#10b981' },
  { name: 'Meeting', value: 198, fill: '#8b5cf6' },
  { name: 'Proposal', value: 124, fill: '#f59e0b' },
  { name: 'Negotiation', value: 78, fill: '#f97316' },
  { name: 'Won', value: 198, fill: '#16a34a' },
];
