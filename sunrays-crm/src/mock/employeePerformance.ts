export interface EmployeePerformanceData {
  id: string;
  name: string;
  department: string;
  designation: string;
  avatarSeed: string;
  status: 'Active' | 'On Leave' | 'Offline';
  email: string;
  phone: string;
  joiningDate: string;
  assignedLeads: number;
  calls: number;
  meetings: number;
  interested: number;
  converted: number;
  conversionRate: number;
  performanceScore: number;
  trend: 'up' | 'down' | 'stable';
  sparkline: number[];
  performanceHistory: { name: string; value: number }[];
  conversionHistory: { name: string; value: number }[];
  recentActivities: { id: string; action: string; target: string; time: string; type: string }[];
}

export const mockEmployeePerformance: EmployeePerformanceData[] = [
  {
    id: 'emp-001',
    name: 'Rahul Sharma',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    avatarSeed: 'Rahul',
    assignedLeads: 186,
    calls: 342,
    meetings: 28,
    interested: 74,
    converted: 52,
    conversionRate: 27.96,
    performanceScore: 94,
    trend: 'up',
    sparkline: [72, 78, 82, 85, 88, 91, 94],
    status: 'Active',
    email: 'rahul.s@sunrays.com',
    phone: '+91 98765 00001',
    joiningDate: 'Jan 15, 2023',
    performanceHistory: [
      { name: 'Mon', value: 82 },
      { name: 'Tue', value: 85 },
      { name: 'Wed', value: 88 },
      { name: 'Thu', value: 91 },
      { name: 'Fri', value: 94 },
    ],
    conversionHistory: [
      { name: 'Jan', value: 22 },
      { name: 'Feb', value: 25 },
      { name: 'Mar', value: 28 },
    ],
    recentActivities: [
      { id: '1', action: 'Converted', target: 'Amit Patel', time: '2 hours ago', type: 'conversion' },
      { id: '2', action: 'Called', target: 'Rajesh Kumar', time: '5 hours ago', type: 'call' },
      { id: '3', action: 'Meeting Scheduled', target: 'Priya Sharma', time: '1 day ago', type: 'meeting' },
    ]
  },
  {
    id: 'emp-002',
    name: 'Priya Mehta',
    department: 'Sales',
    designation: 'Sales Executive',
    avatarSeed: 'Priya',
    assignedLeads: 174,
    calls: 298,
    meetings: 22,
    interested: 65,
    converted: 44,
    conversionRate: 25.29,
    performanceScore: 88,
    trend: 'up',
    sparkline: [65, 70, 74, 78, 82, 85, 88],
    status: 'Active',
    email: 'priya.m@sunrays.com',
    phone: '+91 98765 00002',
    joiningDate: 'Mar 10, 2023',
    performanceHistory: [
      { name: 'Mon', value: 74 },
      { name: 'Tue', value: 78 },
      { name: 'Wed', value: 82 },
      { name: 'Thu', value: 85 },
      { name: 'Fri', value: 88 },
    ],
    conversionHistory: [
      { name: 'Jan', value: 18 },
      { name: 'Feb', value: 22 },
      { name: 'Mar', value: 25 },
    ],
    recentActivities: [
      { id: '1', action: 'Called', target: 'Sneha Reddy', time: '1 hour ago', type: 'call' },
      { id: '2', action: 'Updated', target: 'Vikram Singh', time: '3 hours ago', type: 'update' },
    ]
  },
  {
    id: 'emp-003',
    name: 'Arjun Nair',
    department: 'Inside Sales',
    designation: 'Inside Sales Lead',
    avatarSeed: 'Arjun',
    assignedLeads: 162,
    calls: 318,
    meetings: 19,
    interested: 58,
    converted: 38,
    conversionRate: 23.46,
    performanceScore: 82,
    trend: 'stable',
    sparkline: [80, 81, 82, 80, 81, 82, 82],
    status: 'On Leave',
    email: 'arun.n@sunrays.com',
    phone: '+91 98765 00003',
    joiningDate: 'Jun 22, 2022',
    performanceHistory: [
      { name: 'Mon', value: 82 },
      { name: 'Tue', value: 80 },
      { name: 'Wed', value: 81 },
      { name: 'Thu', value: 82 },
      { name: 'Fri', value: 82 },
    ],
    conversionHistory: [
      { name: 'Jan', value: 20 },
      { name: 'Feb', value: 21 },
      { name: 'Mar', value: 23 },
    ],
    recentActivities: [
      { id: '1', action: 'Scheduled Follow Up', target: 'Neha Gupta', time: '2 days ago', type: 'followup' },
    ]
  },
  {
    id: 'emp-004',
    name: 'Sneha Patil',
    department: 'Business Dev',
    designation: 'BDE',
    avatarSeed: 'Sneha',
    assignedLeads: 148,
    calls: 264,
    meetings: 16,
    interested: 49,
    converted: 31,
    conversionRate: 20.95,
    performanceScore: 76,
    trend: 'up',
    sparkline: [60, 64, 67, 70, 72, 74, 76],
    status: 'Active',
    email: 'sneha.p@sunrays.com',
    phone: '+91 98765 00004',
    joiningDate: 'Nov 05, 2023',
    performanceHistory: [
      { name: 'Mon', value: 67 },
      { name: 'Tue', value: 70 },
      { name: 'Wed', value: 72 },
      { name: 'Thu', value: 74 },
      { name: 'Fri', value: 76 },
    ],
    conversionHistory: [
      { name: 'Jan', value: 15 },
      { name: 'Feb', value: 18 },
      { name: 'Mar', value: 21 },
    ],
    recentActivities: [
      { id: '1', action: 'Called', target: 'Manoj Tiwari', time: '4 hours ago', type: 'call' },
    ]
  },
  {
    id: 'emp-005',
    name: 'Vikram Joshi',
    department: 'Sales',
    designation: 'Sales Executive',
    avatarSeed: 'Vikram',
    assignedLeads: 132,
    calls: 238,
    meetings: 12,
    interested: 41,
    converted: 24,
    conversionRate: 18.18,
    performanceScore: 68,
    trend: 'down',
    sparkline: [75, 72, 70, 69, 68, 68, 68],
    status: 'Offline',
    email: 'vikram.j@sunrays.com',
    phone: '+91 98765 00005',
    joiningDate: 'Aug 18, 2021',
    performanceHistory: [
      { name: 'Mon', value: 70 },
      { name: 'Tue', value: 69 },
      { name: 'Wed', value: 68 },
      { name: 'Thu', value: 68 },
      { name: 'Fri', value: 68 },
    ],
    conversionHistory: [
      { name: 'Jan', value: 19 },
      { name: 'Feb', value: 18 },
      { name: 'Mar', value: 18 },
    ],
    recentActivities: [
      { id: '1', action: 'Called', target: 'Suresh Kumar', time: '1 week ago', type: 'call' },
    ]
  },
];
