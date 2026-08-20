export * from './attendance';

export type Role = 'admin' | 'employee';
export type UserRole = Role;

export type UserStatus = 'Active' | 'On Leave' | 'Offline' | 'Inactive';

export type AppModuleId =
  | 'dashboard'
  | 'assignedClients'
  | 'followUps'
  | 'callHistory'
  | 'attendance'
  | 'profile'
  | 'reports';

export interface ModuleMetadata {
  id: AppModuleId;
  label: string;
  description: string;
  path: string;
  defaultEnabled: boolean;
}

export const AVAILABLE_MODULES: ModuleMetadata[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    description: 'Personal productivity, daily metrics, and performance summary',
    path: '/dashboard',
    defaultEnabled: true,
  },
  {
    id: 'assignedClients',
    label: 'Assigned Clients',
    description: 'Access and manage leads and assigned customer pipeline',
    path: '/dashboard/assigned',
    defaultEnabled: true,
  },
  {
    id: 'followUps',
    label: 'Follow Ups',
    description: 'Schedule, track, and manage pending client follow-ups',
    path: '/dashboard/follow-ups',
    defaultEnabled: true,
  },
  {
    id: 'callHistory',
    label: 'Call History',
    description: 'View interaction logs, call outcomes, and duration records',
    path: '/dashboard/call-history',
    defaultEnabled: true,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Clock in/out, view daily shifts, weekly logs, and monthly attendance',
    path: '/dashboard/attendance',
    defaultEnabled: true,
  },
  {
    id: 'profile',
    label: 'Employee Profile',
    description: 'View and manage personal account details and performance',
    path: '/dashboard/profile',
    defaultEnabled: true,
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    description: 'Access detailed performance analytics and conversion reports',
    path: '/dashboard/reports',
    defaultEnabled: false,
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  isAccessEnabled: boolean;
  allowedModules: string[];
  department?: string;
  designation?: string;
  phone?: string;
  performanceScore?: number;
  assignedLeads?: number;
  calls?: number;
  meetings?: number;
  interested?: number;
  converted?: number;
  conversionRate?: number;
  avatarSeed?: string;
  avatarUrl?: string;
  forcePasswordReset?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: Role;
  status: UserStatus;
  isAccessEnabled: boolean;
  allowedModules: string[];
  performanceScore: number;
  assignedLeads: number;
  calls: number;
  meetings: number;
  interested: number;
  converted: number;
  conversionRate: number;
  avatarSeed: string;
  avatarUrl?: string;
  joiningDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus =
  | 'New'
  | 'Assigned'
  | 'Contacted'
  | 'Interested'
  | 'Follow Up Scheduled'
  | 'Meeting Scheduled'
  | 'Converted'
  | 'Rejected'
  | 'Busy'
  | 'Call Later'
  | 'No Response';

export type Priority = 'High' | 'Medium' | 'Low';
export type AssignmentStatus = 'Assigned' | 'Unassigned';

export interface Interaction {
  id: string;
  employee: string;
  employeeId?: string;
  action: string;
  status: string;
  remark: string;
  createdAt: string;
  type?: 'Incoming' | 'Outgoing' | 'Missed' | 'System';
  duration?: string;
  outcome?: string;
  followUpDate?: string;
  followUpTime?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  location: string;
  status: LeadStatus;
  priority: Priority;
  assignedEmployeeId?: string;
  assignedTo?: string | null;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  assignedDate?: string;
  assignedAt?: string | null;
  assignmentStatus?: AssignmentStatus;
  source?: string;
  sheetRowId?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  notes?: string;
  interactionHistory?: Interaction[];
  createdAt: string;
  updatedAt?: string;
}

export type Lead = Client;

export interface EmployeeLeadCount {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: UserStatus;
  isAccessEnabled: boolean;
  avatarUrl?: string;
  assignedCount: number;
  convertedCount: number;
  interestedCount: number;
}

export interface LeadStats {
  totalLeads: number;
  assignedLeads: number;
  unassignedLeads: number;
  statusCounts: Record<string, number>;
  employeeLeadCounts: EmployeeLeadCount[];
}

export interface SyncReport {
  totalRows: number;
  newLeadsAdded: number;
  duplicatesSkipped: number;
  assignedCount: number;
  unassignedCount: number;
  employeeSummary: Record<string, number>;
  newLeadSamples?: Array<{ name: string; email: string; assignedTo: string; status: string }>;
}

export interface LeadFilterParams {
  search?: string;
  status?: string;
  assignmentStatus?: string;
  employeeId?: string;
  priority?: string;
  source?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CallHistory {
  id: string;
  clientId: string;
  employee: string;
  type: 'Outgoing' | 'Incoming' | 'Missed';
  duration: string;
  status: string;
  outcome: string;
  remark: string;
  followUpDate?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  clientId: string;
  employeeId: string;
  scheduledDate: string;
  scheduledTime: string;
  type: 'Call' | 'Meeting' | 'Email';
  status: 'pending' | 'completed' | 'missed';
  notes?: string;
}

export type NotificationCategory = 'Lead' | 'Follow Up' | 'Meeting' | 'Reminder' | 'System';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
}

export type ActivityType =
  | 'Lead Assigned'
  | 'Client Contacted'
  | 'Follow Up Completed'
  | 'Lead Converted'
  | 'Lead Rejected'
  | 'Meeting Scheduled'
  | 'Status Updated';

export interface DashboardActivity {
  id: string;
  employeeId: string;
  clientId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  assignedLeads: { count: number; percentage: number; trend: 'up' | 'down' };
  callsCompleted: { count: number; percentage: number; trend: 'up' | 'down' };
  pendingFollowUps: { count: number; percentage: number; trend: 'up' | 'down' };
  overdueFollowUps: { count: number; percentage: number; trend: 'up' | 'down' };
  interestedLeads: { count: number; percentage: number; trend: 'up' | 'down' };
  conversionRate: { count: number; percentage: number; trend: 'up' | 'down' };
}
