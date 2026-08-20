import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Lead } from '../models/Lead.js';
import { attendanceRuleService } from '../services/attendanceRuleService.js';
import { leadDistributionService } from '../services/leadDistributionService.js';

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
    assignedLeads: 0,
    lastLeadAssignedAt: new Date(Date.now() - 50000),
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
    assignedLeads: 0,
    lastLeadAssignedAt: new Date(Date.now() - 40000),
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
    assignedLeads: 0,
    lastLeadAssignedAt: new Date(Date.now() - 30000),
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
    assignedLeads: 0,
    lastLeadAssignedAt: new Date(Date.now() - 20000),
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
    assignedLeads: 0,
    lastLeadAssignedAt: null,
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
    assignedLeads: 0,
    lastLeadAssignedAt: new Date(Date.now() - 10000),
    calls: 320,
    meetings: 25,
    interested: 65,
    converted: 45,
    conversionRate: 25.71,
    avatarSeed: 'Ananya',
  },
];

export async function seedInitialAttendance(): Promise<void> {
  try {
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount > 0) {
      return;
    }

    const employees = await User.find({ role: 'employee' });
    if (employees.length === 0) return;

    console.log('[Database] Generating development seed attendance records...');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayDate = now.getDate();

    const attendanceRecords = [];

    // Seed previous 18 days of the current month for each employee
    for (const emp of employees) {
      for (let day = 1; day < todayDate; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Sunday is Week Off
        if (attendanceRuleService.isWeekOff(dateStr)) {
          continue;
        }

        // Leave for Vikram on specific days
        if (emp.email === 'vikram.s@sunrays.com' && day > 10) {
          attendanceRecords.push({
            employeeId: emp._id,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            status: 'Leave',
            workingHours: 0,
            notes: 'Approved Medical Leave',
          });
          continue;
        }

        // Realistic variation
        const isLate = (day + emp.name.length) % 5 === 0;
        const isHalfDay = day % 12 === 0;
        
        const checkInHour = isLate ? 9 : 9;
        const checkInMinute = isLate ? 45 : Math.floor(Math.random() * 20) + 10; // 09:10 - 09:30 or 09:45
        
        const checkOutHour = isHalfDay ? 14 : 18;
        const checkOutMinute = Math.floor(Math.random() * 30) + 30; // 18:30 - 19:00 or 14:30

        const checkInTime = new Date(Date.UTC(year, month - 1, day, checkInHour - 5, checkInMinute - 30)); // UTC approx
        const checkOutTime = new Date(Date.UTC(year, month - 1, day, checkOutHour - 5, checkOutMinute - 30));

        let status = isLate ? 'Late' : 'Present';
        if (isHalfDay) status = 'Half Day';

        const workingHours = isHalfDay ? 4.5 : 8.25;

        attendanceRecords.push({
          employeeId: emp._id,
          date: dateStr,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          status,
          workingHours,
          notes: isLate ? 'Slight traffic delay' : '',
        });
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`[Database] Seeded ${attendanceRecords.length} development attendance records.`);
    }
  } catch (error) {
    console.error('[Database Attendance Seed Error]:', error);
  }
}

export const sampleLeadsData = [
  {
    name: 'Rajesh Kumar',
    company: 'Infosys Limited',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@infosys.com',
    location: 'Bangalore, KA',
    status: 'Interested',
    priority: 'High',
    source: 'Google Sheet',
    notes: 'Looking for enterprise CRM solution. Budget approved for Q3.',
  },
  {
    name: 'Priya Sharma',
    company: 'Tata Consultancy Services',
    phone: '+91 98765 43211',
    email: 'priya.s@tcs.com',
    location: 'Mumbai, MH',
    status: 'Meeting Scheduled',
    priority: 'High',
    source: 'Google Sheet',
    notes: 'Scheduled executive demo for 40+ seat deployment.',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    nextFollowUpTime: '02:00 PM',
  },
  {
    name: 'Amit Patel',
    company: 'Persistent Systems',
    phone: '+91 98765 43212',
    email: 'amit.patel@persistent.com',
    location: 'Pune, MH',
    status: 'New',
    priority: 'Medium',
    source: 'Google Sheet',
    notes: 'Inbound inquiry from tech summit.',
  },
  {
    name: 'Sneha Reddy',
    company: 'Tech Mahindra',
    phone: '+91 98765 43213',
    email: 'sneha.r@techmahindra.com',
    location: 'Hyderabad, TS',
    status: 'Follow Up Scheduled',
    priority: 'High',
    source: 'Google Sheet',
    notes: 'Requested customized pricing deck and security compliance checklist.',
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    nextFollowUpTime: '04:00 PM',
  },
  {
    name: 'Vikramaditya Singh',
    company: 'Larsen & Toubro',
    phone: '+91 98765 43214',
    email: 'vikram.singh@larsentoubro.com',
    location: 'Chennai, TN',
    status: 'Contacted',
    priority: 'Low',
    source: 'Excel Sheet',
    notes: 'Initial introduction call completed. Awaiting decision maker review.',
  },
  {
    name: 'Anjali Desai',
    company: 'Mahindra & Mahindra',
    phone: '+91 98765 43215',
    email: 'anjali.d@mahindra.com',
    location: 'Mumbai, MH',
    status: 'Converted',
    priority: 'High',
    source: 'Google Sheet',
    notes: 'Deal closed for 250 enterprise user licenses.',
  },
  {
    name: 'Rahul Verma',
    company: 'Cummins India',
    phone: '+91 98765 43216',
    email: 'rahul.verma@cummins.com',
    location: 'Pune, MH',
    status: 'Rejected',
    priority: 'Medium',
    source: 'Excel Sheet',
    notes: 'Renewed existing vendor contract for 1 year.',
  },
  {
    name: 'Neha Gupta',
    company: 'Wipro Technologies',
    phone: '+91 98765 43217',
    email: 'neha.g@wipro.com',
    location: 'Bangalore, KA',
    status: 'Assigned',
    priority: 'Medium',
    source: 'Google Sheet',
    notes: 'Newly allocated lead from marketing campaign.',
  },
  {
    name: 'Suresh Menon',
    company: 'HCL Technologies',
    phone: '+91 98765 43218',
    email: 'suresh.m@hcl.com',
    location: 'Noida, UP',
    status: 'Busy',
    priority: 'High',
    source: 'Google Sheet',
    notes: 'Currently in product launch. Requested callback next Tuesday.',
  },
  {
    name: 'Kavita Rao',
    company: 'Mindtree / LTIMindtree',
    phone: '+91 98765 43219',
    email: 'kavita.r@mindtree.com',
    location: 'Bangalore, KA',
    status: 'Call Later',
    priority: 'Medium',
    source: 'Google Sheet',
    notes: 'Traveling overseas until end of the month.',
  },
  {
    name: 'Mohit Sharma',
    company: 'Reliance Jio',
    phone: '+91 98765 43220',
    email: 'mohit.s@ril.com',
    location: 'Navi Mumbai, MH',
    status: 'No Response',
    priority: 'Low',
    source: 'Google Sheet',
    notes: 'Left 2 voicemails and sent email follow-up.',
  },
  {
    name: 'Arun Jha',
    company: 'Tata Motors',
    phone: '+91 98765 43221',
    email: 'arun.jha@tatamotors.com',
    location: 'Pune, MH',
    status: 'Interested',
    priority: 'High',
    source: 'Excel Sheet',
    notes: 'Very interested in lead auto-distribution and attendance tracking features.',
  },
];

export async function seedInitialLeads(): Promise<void> {
  try {
    const leadCount = await Lead.countDocuments();
    if (leadCount > 0) {
      return;
    }

    console.log('[Database] Generating development seed leads...');
    const activeEmployees = await leadDistributionService.getActiveEmployees();

    const leadDocs = sampleLeadsData.map((data, index) => {
      const lead = new Lead({
        ...data,
        sheetRowId: `seed-lead-${index + 1}`,
        assignmentStatus: 'Unassigned',
      });
      return lead;
    });

    if (activeEmployees.length > 0) {
      await leadDistributionService.distributeNewLeads(leadDocs);
    }

    await Lead.insertMany(leadDocs);
    console.log(`[Database] Seeded ${leadDocs.length} sample leads with auto-assignments.`);
  } catch (error) {
    console.error('[Database Lead Seed Error]:', error);
  }
}

export async function seedInitialUsers(): Promise<void> {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding initial admin and employee accounts...');
      for (const userData of seedUsersData) {
        await User.create(userData);
      }
      console.log('[Database] Seeded default users successfully.');
    }
    await seedInitialAttendance();
    await seedInitialLeads();
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
      console.log('[Seed] --fresh flag detected. Clearing existing users, attendance, and leads collections...');
      await User.deleteMany({});
      await Attendance.deleteMany({});
      await Lead.deleteMany({});
      console.log('[Seed] Cleared users, attendance, and leads collections.');
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

    await seedInitialAttendance();
    await seedInitialLeads();

    console.log(`\n[Seed] Successfully seeded ${seedUsersData.length} users and leads into MongoDB.`);
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
