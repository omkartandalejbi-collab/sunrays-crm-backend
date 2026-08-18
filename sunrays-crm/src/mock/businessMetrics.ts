export const mockBusinessMetrics = {
  revenue: { value: '₹71.2L', change: 14.8, isPositive: true, subtitle: 'This Month' },
  dealsClosed: { value: 198, change: 12.4, isPositive: true, subtitle: 'Conversions' },
  avgResponseTime: { value: '2.4 hrs', change: 18.2, isPositive: true, subtitle: 'Faster than last month' },
  avgSalesCycle: { value: '18 days', change: 3.1, isPositive: true, subtitle: 'Avg to convert' },
};

export const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 3800000, deals: 82 },
  { month: 'Feb', revenue: 4200000, deals: 94 },
  { month: 'Mar', revenue: 4900000, deals: 112 },
  { month: 'Apr', revenue: 5400000, deals: 128 },
  { month: 'May', revenue: 6100000, deals: 148 },
  { month: 'Jun', revenue: 5800000, deals: 138 },
  { month: 'Jul', revenue: 7120000, deals: 198 },
];

export const mockQuickInsights = [
  {
    id: 'ins-001',
    type: 'positive' as const,
    icon: '↑',
    text: 'Conversions increased 14% this week compared to last week',
    priority: 'high' as const,
    time: '2 hours ago',
  },
  {
    id: 'ins-002',
    type: 'warning' as const,
    icon: '↓',
    text: 'Facebook leads dropped 9% — consider reviewing ad spend',
    priority: 'medium' as const,
    time: '4 hours ago',
  },
  {
    id: 'ins-003',
    type: 'star' as const,
    icon: '★',
    text: 'Rahul Sharma is the top performer this month with 94% score',
    priority: 'low' as const,
    time: '6 hours ago',
  },
  {
    id: 'ins-004',
    type: 'alert' as const,
    icon: '!',
    text: '18 leads have had no contact in 7+ days — reassignment suggested',
    priority: 'high' as const,
    time: 'Yesterday',
  },
  {
    id: 'ins-005',
    type: 'positive' as const,
    icon: '✓',
    text: 'Average response time improved by 18% — team is more responsive',
    priority: 'medium' as const,
    time: 'Yesterday',
  },
  {
    id: 'ins-006',
    type: 'positive' as const,
    icon: '↑',
    text: 'Google Ads delivering highest quality leads with 29.9% conversion',
    priority: 'medium' as const,
    time: '2 days ago',
  },
  {
    id: 'ins-007',
    type: 'warning' as const,
    icon: '!',
    text: 'Negotiation stage has 78 stalled leads — review required',
    priority: 'high' as const,
    time: '2 days ago',
  },
];
