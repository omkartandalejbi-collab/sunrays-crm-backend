import { User } from '../models/User.js';

export const seedInitialUsers = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('[Database] Seeding initial admin and employee accounts...');

    const defaultModules = ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'];
    const allModules = ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile', 'reports'];

    const initialUsers = [
      {
        name: 'Admin User',
        email: 'admin@sunrays.com',
        password: 'admin123',
        role: 'admin',
        status: 'Active',
        isAccessEnabled: true,
        allowedModules: allModules,
        department: 'Management',
        designation: 'System Administrator',
        phone: '+91 98765 00000',
        performanceScore: 100,
        avatarSeed: 'Admin',
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.s@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'Active',
        isAccessEnabled: true,
        allowedModules: defaultModules,
        department: 'Sales',
        designation: 'Senior Sales Executive',
        phone: '+91 98765 00001',
        performanceScore: 94,
        assignedLeads: 186,
        calls: 342,
        meetings: 28,
        interested: 74,
        converted: 52,
        conversionRate: 27.96,
        avatarSeed: 'Rahul',
      },
      {
        name: 'Priya Mehta',
        email: 'priya.m@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'Active',
        isAccessEnabled: true,
        allowedModules: defaultModules,
        department: 'Sales',
        designation: 'Sales Executive',
        phone: '+91 98765 00002',
        performanceScore: 88,
        assignedLeads: 174,
        calls: 298,
        meetings: 22,
        interested: 65,
        converted: 44,
        conversionRate: 25.29,
        avatarSeed: 'Priya',
      },
      {
        name: 'Arjun Nair',
        email: 'arun.n@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'On Leave',
        isAccessEnabled: true,
        allowedModules: defaultModules,
        department: 'Inside Sales',
        designation: 'Inside Sales Lead',
        phone: '+91 98765 00003',
        performanceScore: 82,
        assignedLeads: 162,
        calls: 318,
        meetings: 19,
        interested: 58,
        converted: 38,
        conversionRate: 23.46,
        avatarSeed: 'Arjun',
      },
      {
        name: 'Sneha Patil',
        email: 'sneha.p@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'Active',
        isAccessEnabled: true,
        allowedModules: defaultModules,
        department: 'Business Dev',
        designation: 'BDE',
        phone: '+91 98765 00004',
        performanceScore: 76,
        assignedLeads: 148,
        calls: 264,
        meetings: 16,
        interested: 49,
        converted: 31,
        conversionRate: 20.95,
        avatarSeed: 'Sneha',
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.j@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'Offline',
        isAccessEnabled: false,
        allowedModules: ['dashboard', 'assignedClients', 'profile'],
        department: 'Sales',
        designation: 'Sales Executive',
        phone: '+91 98765 00005',
        performanceScore: 68,
        assignedLeads: 132,
        calls: 238,
        meetings: 12,
        interested: 41,
        converted: 24,
        conversionRate: 18.18,
        avatarSeed: 'Vikram',
      },
      {
        name: 'Jane Doe',
        email: 'employee@sunrays.com',
        password: 'employee123',
        role: 'employee',
        status: 'Active',
        isAccessEnabled: true,
        allowedModules: defaultModules,
        department: 'Sales',
        designation: 'Senior Sales Executive',
        phone: '+91 98765 43210',
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

    for (const userData of initialUsers) {
      const user = new User(userData);
      await user.save();
    }

    console.log(`[Database] Successfully seeded ${initialUsers.length} initial users.`);
  } catch (error) {
    console.error('[Database] Seeding error:', error);
  }
};
