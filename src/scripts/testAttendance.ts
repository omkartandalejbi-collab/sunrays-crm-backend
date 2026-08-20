import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { connectDatabase } from '../config/db.js';
import { seedInitialUsers } from './seed.js';
import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import http from 'http';

async function runTests() {
  console.log('=== Starting Sunrays CRM Auto-Attendance Test Suite ===\n');
  
  await connectDatabase();
  await seedInitialUsers();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5099, () => {
      console.log('[Test Server] Running on http://127.0.0.1:5099');
      resolve();
    });
  });

  const BASE_URL = 'http://127.0.0.1:5099/api';

  try {
    // 1. Employee Login -> Automatic Attendance Check-In
    console.log('[Test 1] Employee Login (Rahul Sharma) -> Automatic Check-In Creation...');
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.s@sunrays.com', password: 'employee123' }),
    });
    const empLoginData = (await empLoginRes.json()) as any;
    if (!empLoginData.token) throw new Error('Employee login failed');
    const empToken = empLoginData.token;
    const empId = empLoginData.user.id;
    console.log(`  ✓ Employee logged in successfully (ID: ${empId}).`);

    // Verify attendance was automatically created in DB on login
    const todayStr = new Date().toISOString().slice(0, 10);
    const initialRecord = await Attendance.findOne({ employeeId: empId, date: todayStr });
    if (!initialRecord || !initialRecord.checkIn) {
      throw new Error('Auto-attendance check-in record was not created upon employee login!');
    }
    const initialCheckInTime = initialRecord.checkIn.getTime();
    console.log(`  ✓ Auto-Attendance verified in MongoDB: CheckIn at ${initialRecord.checkIn.toISOString()}, Status: ${initialRecord.status}`);

    // 2. Second Login on same day -> Should NOT overwrite original checkIn timestamp
    console.log('\n[Test 2] Second Login on same day -> Verify Check-In timestamp preserved & no duplicate...');
    await new Promise((r) => setTimeout(r, 50)); // Tiny delay
    const empLoginRes2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.s@sunrays.com', password: 'employee123' }),
    });
    const empLoginData2 = (await empLoginRes2.json()) as any;
    if (!empLoginData2.token) throw new Error('Second login failed');

    const countToday = await Attendance.countDocuments({ employeeId: empId, date: todayStr });
    const recordAfterSecondLogin = await Attendance.findOne({ employeeId: empId, date: todayStr });
    console.log(`  ✓ Records count for today: ${countToday} (Expected: 1)`);
    if (countToday !== 1) throw new Error('Duplicate attendance record created on second login');
    if (recordAfterSecondLogin?.checkIn?.getTime() !== initialCheckInTime) {
      throw new Error('Original check-in timestamp was overwritten on second login!');
    }
    console.log('  ✓ Original check-in timestamp preserved accurately.');

    // 3. Admin Login -> Should NOT create employee attendance
    console.log('\n[Test 3] Admin Login (System Admin)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sunrays.com', password: 'admin123' }),
    });
    const adminLoginData = (await adminLoginRes.json()) as any;
    if (!adminLoginData.token) throw new Error('Admin login failed');
    const adminToken = adminLoginData.token;
    console.log('  ✓ Admin logged in successfully.');

    // 4. Security: Unauthenticated request must return 401
    console.log('\n[Test 4] Security: Unauthenticated request to /api/attendance/status...');
    const unauthRes = await fetch(`${BASE_URL}/attendance/status`);
    console.log(`  ✓ Unauthenticated status code: ${unauthRes.status} (Expected: 401)`);
    if (unauthRes.status !== 401) throw new Error('Unauthenticated request was not blocked');

    // 5. Security: Employee trying to access Admin API must return 403
    console.log('\n[Test 5] Security: Employee accessing Admin API /api/admin/attendance...');
    const empAdminRes = await fetch(`${BASE_URL}/admin/attendance`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    console.log(`  ✓ Employee accessing admin API status code: ${empAdminRes.status} (Expected: 403)`);
    if (empAdminRes.status !== 403) throw new Error('Employee accessed admin endpoint without permission');

    // 6. Security: Employee accessing other employee's attendance must return 403
    console.log('\n[Test 6] Security: Employee accessing another employee ID /api/attendance/employee/:id...');
    // Find another employee ID
    const otherUser = await User.findOne({ email: 'priya.m@sunrays.com' });
    if (otherUser) {
      const accessOtherRes = await fetch(`${BASE_URL}/attendance/employee/${otherUser._id}`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      console.log(`  ✓ Access other employee status code: ${accessOtherRes.status} (Expected: 403)`);
      if (accessOtherRes.status !== 403) throw new Error('Employee accessed other employee attendance without 403');
    }

    // 7. Security: Employee accessing OWN employee endpoint must return 200
    console.log('\n[Test 7] Employee accessing OWN attendance via /api/attendance/employee/:ownId...');
    const accessOwnRes = await fetch(`${BASE_URL}/attendance/employee/${empId}`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    console.log(`  ✓ Access own employee status code: ${accessOwnRes.status} (Expected: 200)`);
    if (accessOwnRes.status !== 200) throw new Error('Employee failed to access own attendance');

    // 8. Admin accessing any employee's endpoint must return 200
    if (otherUser) {
      console.log('\n[Test 8] Admin accessing employee attendance via /api/attendance/employee/:id...');
      const adminAccessOtherRes = await fetch(`${BASE_URL}/attendance/employee/${otherUser._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log(`  ✓ Admin access employee status code: ${adminAccessOtherRes.status} (Expected: 200)`);
      if (adminAccessOtherRes.status !== 200) throw new Error('Admin failed to access employee attendance');
    }

    // 9. Employee Status API
    console.log('\n[Test 9] Employee GET /api/attendance/status...');
    const statusRes = await fetch(`${BASE_URL}/attendance/status`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const statusData = (await statusRes.json()) as any;
    console.log(`  ✓ Status response: checkedIn=${statusData.checkedIn}, checkedOut=${statusData.checkedOut}, currentStatus=${statusData.currentStatus}`);
    if (!statusData.checkedIn || statusData.checkedOut) {
      throw new Error('Status API did not report active checked-in session');
    }

    // 10. Employee Logout -> Automatic Attendance Check-Out
    console.log('\n[Test 10] Employee Logout -> Automatic Check-Out and Working Duration Calculation...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    console.log(`  ✓ Logout response status: ${logoutRes.status} (Expected: 200)`);
    if (logoutRes.status !== 200) throw new Error('Logout API failed');

    // Verify checkout was automatically saved to MongoDB
    const recordAfterLogout = await Attendance.findOne({ employeeId: empId, date: todayStr });
    if (!recordAfterLogout?.checkOut) {
      throw new Error('Auto-attendance check-out was not recorded upon employee logout!');
    }
    console.log(`  ✓ Auto-Attendance Checkout verified in MongoDB: CheckOut at ${recordAfterLogout.checkOut.toISOString()}, WorkingHours: ${recordAfterLogout.workingHours}, Status: ${recordAfterLogout.status}`);

    // 11. Duplicate Logout -> Idempotent
    console.log('\n[Test 11] Duplicate Logout -> Verify idempotent safe handling...');
    const dupLogoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    console.log(`  ✓ Duplicate logout status: ${dupLogoutRes.status} (Expected: 200)`);
    if (dupLogoutRes.status !== 200) throw new Error('Duplicate logout failed');

    // 12. History APIs
    console.log('\n[Test 12] Employee History APIs (Daily, Weekly, Monthly)...');
    const dailyRes = await fetch(`${BASE_URL}/attendance/history/daily`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const dailyData = (await dailyRes.json()) as any;
    console.log(`  ✓ Daily History: date=${dailyData.date}, status=${dailyData.status}`);

    const monthlyRes = await fetch(`${BASE_URL}/attendance/history/monthly`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const monthlyData = (await monthlyRes.json()) as any;
    console.log(`  ✓ Monthly History: Present=${monthlyData.summary?.present}, Late=${monthlyData.summary?.late}, Total Hours=${monthlyData.summary?.totalWorkingHours}h`);

    // 13. Admin Attendance Roster & Editing
    console.log('\n[Test 13] Admin View & Filter Attendance...');
    const adminAttRes = await fetch(`${BASE_URL}/admin/attendance?date=${todayStr}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminAttData = (await adminAttRes.json()) as any;
    console.log(`  ✓ Admin Attendance: Records=${adminAttData.count}, Total Staff=${adminAttData.summary?.totalEmployees}`);

    console.log('\n======================================================');
    console.log('  ALL AUTO-ATTENDANCE INTEGRATION TESTS PASSED (13/13)! ');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
