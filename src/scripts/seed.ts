import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

dotenv.config();

const defaultModules = ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'];
const allModules = ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile', 'reports'];

export const seedUsersData = [
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
    assignedLeads: 142,
    calls: 290,
    meetings: 22,
    interested: 58,
    converted: 36,
    conversionRate: 25.35,
    avatarSeed: 'Priya',
  },
  {
    name: 'Amit Patel',
    email: 'amit.p@sunrays.com',
    password: 'employee123',
    role: 'employee',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: defaultModules,
    department: 'Inside Sales',
    designation: 'Account Executive',
    phone: '+91 98765 00003',
    performanceScore: 82,
    assignedLeads: 165,
    calls: 310,
    meetings: 18,
    interested: 48,
    converted: 28,
    conversionRate: 16.97,
    avatarSeed: 'Amit',
  },
  {
    name: 'Sneha Rao',
    email: 'sneha.r@sunrays.com',
    password: 'employee123',
    role: 'employee',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: defaultModules,
    department: 'Business Dev',
    designation: 'BDE Specialist',
    phone: '+91 98765 00004',
    performanceScore: 76,
    assignedLeads: 120,
    calls: 240,
    meetings: 15,
    interested: 35,
    converted: 18,
    conversionRate: 15.0,
    avatarSeed: 'Sneha',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.s@sunrays.com',
    password: 'employee123',
    role: 'employee',
    status: 'On Leave',
    isAccessEnabled: true,
    allowedModules: defaultModules,
    department: 'Inside Sales',
    designation: 'Sales Associate',
    phone: '+91 98765 00005',
    performanceScore: 68,
    assignedLeads: 95,
    calls: 180,
    meetings: 10,
    interested: 22,
    converted: 11,
    conversionRate: 11.58,
    avatarSeed: 'Vikram',
  },
  {
    name: 'Ananya Roy',
    email: 'ananya.r@sunrays.com',
    password: 'employee123',
    role: 'employee',
    status: 'Active',
    isAccessEnabled: true,
    allowedModules: allModules,
    department: 'Sales',
    designation: 'Team Lead',
    phone: '+91 98765 00006',
    performanceScore: 91,
    assignedLeads: 175,
    calls: 320,
    meetings: 25,
    interested: 65,
    converted: 45,
    conversionRate: 25.71,
    avatarSeed: 'Ananya',
  },
];

export async function seedInitialUsers(): Promise<void> {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('[Database] Seeding initial admin and employee accounts...');
    for (const userData of seedUsersData) {
      await User.create(userData);
    }
    console.log('[Database] Seeded default users successfully.');
  } catch (error) {
    console.error('[Database Seed Error]:', error);
  }
}

export async function runSeed(): Promise<void> {
  const isFresh = process.argv.includes('--fresh') || process.argv.includes('--force');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sunrays_crm';

  try {
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    if (isFresh) {
      console.log('[Seed] --fresh flag detected. Clearing existing users collection...');
      await User.deleteMany({});
      console.log('[Seed] Cleared users collection.');
    } else {
      const count = await User.countDocuments();
      if (count > 0) {
        console.log(`[Seed] Database already has ${count} users. Use --fresh to clear and reseed.`);
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    console.log('[Seed] Creating seed users...');
    for (const userData of seedUsersData) {
      await User.create(userData);
      console.log(`  ✓ Created ${userData.role.toUpperCase()}: ${userData.name} (${userData.email})`);
    }

    console.log(`\n[Seed] Successfully seeded ${seedUsersData.length} users into MongoDB.`);
    console.log('\nDefault credentials:');
    console.log('  Admin:    admin@sunrays.com    / admin123');
    console.log('  Employee: rahul.s@sunrays.com  / employee123');
    console.log('  Employee: priya.m@sunrays.com  / employee123\n');
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
    process.exit(0);
  }
}

// Auto-run if executed directly via CLI
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  runSeed();
}
