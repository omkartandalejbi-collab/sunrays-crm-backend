import type { User, Employee } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Admin User',
    email: 'admin@sunrays.com',
    role: 'admin',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile', 'reports'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: 'usr-emp-1',
    name: 'Jane Doe',
    email: 'employee@sunrays.com',
    role: 'employee',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    userId: 'usr-emp-1',
    name: 'Jane Doe',
    email: 'employee@sunrays.com',
    role: 'employee',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
    department: 'Sales',
    designation: 'Senior Sales Executive',
    phone: '+91 98765 43210',
    joiningDate: '2023-01-15T00:00:00Z',
    performanceScore: 92,
    assignedLeads: 142,
    calls: 250,
    meetings: 15,
    interested: 45,
    converted: 30,
    conversionRate: 21.12,
    avatarSeed: 'Jane',
  },
];
