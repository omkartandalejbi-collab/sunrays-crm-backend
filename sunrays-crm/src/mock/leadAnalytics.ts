export interface LeadSourceData {
  source: string;
  icon: string;
  leads: number;
  interested: number;
  converted: number;
  conversionRate: number;
  revenue: number;
  color: string;
}

export const mockLeadSources: LeadSourceData[] = [
  {
    source: 'Google Ads',
    icon: '🔍',
    leads: 224,
    interested: 98,
    converted: 67,
    conversionRate: 29.91,
    revenue: 1876000,
    color: '#3b82f6',
  },
  {
    source: 'Referral',
    icon: '🤝',
    leads: 189,
    interested: 94,
    converted: 61,
    conversionRate: 32.28,
    revenue: 1654000,
    color: '#10b981',
  },
  {
    source: 'Website',
    icon: '🌐',
    leads: 167,
    interested: 72,
    converted: 44,
    conversionRate: 26.35,
    revenue: 1122000,
    color: '#6366f1',
  },
  {
    source: 'LinkedIn',
    icon: '💼',
    leads: 142,
    interested: 58,
    converted: 34,
    conversionRate: 23.94,
    revenue: 968000,
    color: '#0077b5',
  },
  {
    source: 'Walk In',
    icon: '🚶',
    leads: 98,
    interested: 52,
    converted: 28,
    conversionRate: 28.57,
    revenue: 742000,
    color: '#f59e0b',
  },
  {
    source: 'Facebook',
    icon: '📘',
    leads: 134,
    interested: 44,
    converted: 22,
    conversionRate: 16.42,
    revenue: 524000,
    color: '#1877f2',
  },
  {
    source: 'Instagram',
    icon: '📸',
    leads: 87,
    interested: 31,
    converted: 18,
    conversionRate: 20.69,
    revenue: 412000,
    color: '#e1306c',
  },
  {
    source: 'Cold Calls',
    icon: '📞',
    leads: 112,
    interested: 28,
    converted: 14,
    conversionRate: 12.5,
    revenue: 318000,
    color: '#64748b',
  },
];

export const mockPipelineHealth = [
  { stage: 'Assigned', count: 847, percentage: 100, color: '#3b82f6' },
  { stage: 'Contacted', count: 621, percentage: 73.3, color: '#6366f1' },
  { stage: 'Interested', count: 387, percentage: 45.7, color: '#10b981' },
  { stage: 'Meeting', count: 198, percentage: 23.4, color: '#8b5cf6' },
  { stage: 'Proposal', count: 124, percentage: 14.6, color: '#f59e0b' },
  { stage: 'Negotiation', count: 78, percentage: 9.2, color: '#f97316' },
  { stage: 'Won', count: 198, percentage: 23.4, color: '#16a34a' },
];
