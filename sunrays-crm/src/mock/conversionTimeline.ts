import { subDays, subHours } from 'date-fns';

const today = new Date();

export interface ConversionEvent {
  id: string;
  clientName: string;
  company: string;
  employeeName: string;
  employeeAvatar: string;
  dealValue: number;
  leadSource: string;
  convertedAt: string;
  daysToConvert: number;
}

export const mockConversionTimeline: ConversionEvent[] = [
  {
    id: 'cv-001',
    clientName: 'Rajesh Kumar',
    company: 'Infosys Technologies',
    employeeName: 'Rahul Sharma',
    employeeAvatar: 'Rahul',
    dealValue: 480000,
    leadSource: 'Google Ads',
    convertedAt: subHours(today, 3).toISOString(),
    daysToConvert: 12,
  },
  {
    id: 'cv-002',
    clientName: 'Ananya Singh',
    company: 'Wipro Digital',
    employeeName: 'Priya Mehta',
    employeeAvatar: 'Priya',
    dealValue: 320000,
    leadSource: 'Referral',
    convertedAt: subHours(today, 8).toISOString(),
    daysToConvert: 8,
  },
  {
    id: 'cv-003',
    clientName: 'Suresh Gupta',
    company: 'HCL Technologies',
    employeeName: 'Rahul Sharma',
    employeeAvatar: 'Rahul',
    dealValue: 650000,
    leadSource: 'LinkedIn',
    convertedAt: subDays(today, 1).toISOString(),
    daysToConvert: 21,
  },
  {
    id: 'cv-004',
    clientName: 'Meera Patel',
    company: 'Tech Mahindra',
    employeeName: 'Arjun Nair',
    employeeAvatar: 'Arjun',
    dealValue: 285000,
    leadSource: 'Website',
    convertedAt: subDays(today, 1).toISOString(),
    daysToConvert: 15,
  },
  {
    id: 'cv-005',
    clientName: 'Amit Bose',
    company: 'Tata Consultancy',
    employeeName: 'Sneha Patil',
    employeeAvatar: 'Sneha',
    dealValue: 412000,
    leadSource: 'Google Ads',
    convertedAt: subDays(today, 2).toISOString(),
    daysToConvert: 18,
  },
  {
    id: 'cv-006',
    clientName: 'Divya Krishnan',
    company: 'Capgemini India',
    employeeName: 'Priya Mehta',
    employeeAvatar: 'Priya',
    dealValue: 195000,
    leadSource: 'Walk In',
    convertedAt: subDays(today, 2).toISOString(),
    daysToConvert: 6,
  },
  {
    id: 'cv-007',
    clientName: 'Rohit Malhotra',
    company: 'Cognizant Technology',
    employeeName: 'Arjun Nair',
    employeeAvatar: 'Arjun',
    dealValue: 540000,
    leadSource: 'Referral',
    convertedAt: subDays(today, 3).toISOString(),
    daysToConvert: 24,
  },
  {
    id: 'cv-008',
    clientName: 'Kavitha Nair',
    company: 'Oracle India',
    employeeName: 'Vikram Joshi',
    employeeAvatar: 'Vikram',
    dealValue: 228000,
    leadSource: 'Cold Calls',
    convertedAt: subDays(today, 3).toISOString(),
    daysToConvert: 31,
  },
];
