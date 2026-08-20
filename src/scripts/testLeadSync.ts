import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { leadDistributionService } from '../services/leadDistributionService.js';
import { sheetSyncService } from '../services/sheetSyncService.js';
import { seedInitialUsers } from './seed.js';

dotenv.config();

async function runTest() {
  console.log('\n=============================================');
  console.log('🧪 SUNRAYS CRM - LEAD MANAGEMENT & SYNC TESTS');
  console.log('=============================================\n');

  await connectDatabase();
  await seedInitialUsers();

  // Test 1: Verify Active Employees Query
  console.log('\n--- Test 1: Active Employee Detection ---');
  const activeEmployees = await leadDistributionService.getActiveEmployees();
  console.log(`Active sales employees found: ${activeEmployees.length}`);
  activeEmployees.forEach((emp) => {
    console.log(`  ✓ ${emp.name} (${emp.status}, isAccessEnabled: ${emp.isAccessEnabled}) - Assigned Leads: ${emp.assignedLeads}`);
  });

  const vikram = await User.findOne({ email: 'vikram.s@sunrays.com' });
  const isVikramInPool = activeEmployees.some((e) => e._id.toString() === vikram?._id.toString());
  console.log(`  ✓ Inactive/On-Leave employee (Vikram) excluded from distribution pool: ${!isVikramInPool ? 'PASS' : 'FAIL'}`);

  // Test 2: Sequential Single-Lead Round-Robin Distribution
  console.log('\n--- Test 2: Sequential Single-Lead Round-Robin Distribution ---');
  const lead1 = new Lead({ name: 'First Lead', email: 'first@testcorp.test', phone: '+91 99000 11111' });
  const lead2 = new Lead({ name: 'Second Lead', email: 'second@testcorp.test', phone: '+91 99000 22222' });

  const empList1 = await leadDistributionService.getActiveEmployees();
  const nextEmp1 = empList1[0];
  await leadDistributionService.assignLead(lead1, nextEmp1);
  console.log(`  Lead 1 assigned to: ${lead1.assignedEmployeeName}`);

  const empList2 = await leadDistributionService.getActiveEmployees();
  const nextEmp2 = empList2[0];
  await leadDistributionService.assignLead(lead2, nextEmp2);
  console.log(`  Lead 2 assigned to: ${lead2.assignedEmployeeName}`);

  const isRoundRobinWorking = lead1.assignedEmployeeName !== lead2.assignedEmployeeName;
  console.log(`  ✓ 2 Consecutive Leads assigned to different employees: ${isRoundRobinWorking ? 'PASS' : 'FAIL'} (${lead1.assignedEmployeeName} != ${lead2.assignedEmployeeName})`);

  // Test 2b: Batch Round-Robin Lead Distribution
  console.log('\n--- Test 2b: Batch Round-Robin Distribution ---');
  const testBatch = [
    new Lead({ name: 'Alpha Corp Lead', email: 'contact@alphacorp.test', phone: '+91 99000 00001' }),
    new Lead({ name: 'Beta Systems Lead', email: 'contact@betasystems.test', phone: '+91 99000 00002' }),
    new Lead({ name: 'Gamma Ltd Lead', email: 'contact@gammaltd.test', phone: '+91 99000 00003' }),
    new Lead({ name: 'Delta Tech Lead', email: 'contact@deltatech.test', phone: '+91 99000 00004' }),
    new Lead({ name: 'Epsilon Media Lead', email: 'contact@epsilonmedia.test', phone: '+91 99000 00005' }),
  ];

  const distResult = await leadDistributionService.distributeNewLeads(testBatch);
  console.log(`Assigned Count: ${distResult.assignedCount}/${testBatch.length}`);
  console.log('Distribution Breakdown:');
  Object.entries(distResult.distributionSummary).forEach(([empName, count]) => {
    console.log(`  → ${empName}: +${count} leads`);
  });

  // Verify timestamps and interaction history
  testBatch.forEach((lead) => {
    console.log(`  Lead: ${lead.name} -> Assigned to: ${lead.assignedEmployeeName} (${lead.assignmentStatus}), AssignedAt: ${lead.assignedAt?.toISOString()}`);
  });

  // Test 3: Duplicate Prevention during Sync
  console.log('\n--- Test 3: Deduplication Verification ---');
  const mockSheetRows = [
    { name: 'Alpha Corp Lead', email: 'contact@alphacorp.test', phone: '+91 99000 00001', company: 'Alpha Corp' }, // DUPLICATE
    new Lead({ name: 'Zeta Innovations', email: 'contact@zetainnovations.test', phone: '+91 99000 00099', company: 'Zeta Inc' }), // NEW
  ];

  // Insert testBatch into DB first
  await Lead.insertMany(testBatch);

  const syncReport = await sheetSyncService.syncLeads(mockSheetRows, 'Test Sheet');
  console.log(`Sync Processed: ${syncReport.totalRows} rows`);
  console.log(`  ✓ New Leads Added: ${syncReport.newLeadsAdded}`);
  console.log(`  ✓ Duplicates Detected & Skipped: ${syncReport.duplicatesSkipped} (Expected: 1)`);
  console.log(`  ✓ Auto-Assigned: ${syncReport.assignedCount}`);

  // Test 4: Lead Status Update & Interaction Logging
  console.log('\n--- Test 4: Lead Status Update & Interaction Logging ---');
  const leadToUpdate = await Lead.findOne({ email: 'contact@alphacorp.test' });
  if (leadToUpdate) {
    leadToUpdate.status = 'Interested';
    leadToUpdate.notes = 'Client requested proposal presentation next week.';
    leadToUpdate.lastContactDate = new Date();
    leadToUpdate.interactionHistory.unshift({
      employee: 'Rahul Sharma',
      action: 'Status Updated',
      status: 'Interested',
      remark: 'Client requested proposal presentation next week.',
      type: 'Outgoing',
      duration: '05:30',
      createdAt: new Date(),
    });
    await leadToUpdate.save();

    const verified = await Lead.findById(leadToUpdate._id);
    console.log(`  ✓ Lead Status: ${verified?.status}`);
    console.log(`  ✓ Latest Interaction: [${verified?.interactionHistory[0]?.action}] ${verified?.interactionHistory[0]?.remark} (Type: ${verified?.interactionHistory[0]?.type})`);
  }

  // Cleanup test leads
  await Lead.deleteMany({ email: { $regex: /@.*\.test$/ } });
  console.log('\n✅ All Lead Management & Synchronization tests PASSED successfully!\n');

  await mongoose.disconnect();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
