import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { Lead, ILead } from '../models/Lead.js';

export interface AssigneeResult {
  employee: IUser;
  leadCount: number;
}

export class LeadDistributionService {
  /**
   * Retrieves all currently active sales employees who are eligible to receive leads.
   * Condition: role === 'employee' AND status === 'Active' AND isAccessEnabled === true
   * Sorted by lastLeadAssignedAt (oldest first or never assigned first) then createdAt.
   */
  async getActiveEmployees(): Promise<IUser[]> {
    return User.find({
      role: 'employee',
      status: 'Active',
      isAccessEnabled: true,
    }).sort({ lastLeadAssignedAt: 1, createdAt: 1 });
  }

  /**
   * Picks the next employee for assignment using pure round-robin rotation.
   * Prioritizes the active employee who was assigned a lead least recently.
   */
  selectNextEmployee(activeEmployees: IUser[], currentRotationIndex = 0): IUser | null {
    if (!activeEmployees || activeEmployees.length === 0) {
      return null;
    }
    return activeEmployees[currentRotationIndex % activeEmployees.length] || activeEmployees[0];
  }

  /**
   * Assigns a single lead to an employee, updating timestamps, status, and interaction history.
   */
  async assignLead(
    lead: ILead,
    employee: IUser,
    options?: { note?: string; assignedBy?: string }
  ): Promise<ILead> {
    const previousEmployeeId = lead.assignedTo?.toString();
    const newEmployeeId = employee._id.toString();
    const now = new Date();

    // If changing employee, adjust previous employee count
    if (previousEmployeeId && previousEmployeeId !== newEmployeeId) {
      await User.findByIdAndUpdate(previousEmployeeId, { $inc: { assignedLeads: -1 } });
    }

    lead.assignedTo = employee._id;
    lead.assignedEmployeeName = employee.name;
    lead.assignedEmployeeEmail = employee.email;
    lead.assignedAt = now;
    lead.assignmentStatus = 'Assigned';

    if (lead.status === 'New') {
      lead.status = 'Assigned';
    }

    const remark =
      options?.note ||
      (options?.assignedBy
        ? `Lead assigned to ${employee.name} by ${options.assignedBy}.`
        : `Lead automatically assigned to ${employee.name} via round-robin distribution.`);

    lead.interactionHistory.unshift({
      employee: employee.name,
      employeeId: employee._id,
      action: 'Lead Assigned',
      status: lead.status,
      remark,
      type: 'System',
      createdAt: now,
    });

    await lead.save();

    // Update newly assigned employee's counter and lastLeadAssignedAt timestamp
    await User.findByIdAndUpdate(employee._id, {
      $inc: { assignedLeads: previousEmployeeId !== newEmployeeId ? 1 : 0 },
      $set: { lastLeadAssignedAt: now },
    });
    employee.assignedLeads = (employee.assignedLeads || 0) + 1;
    employee.lastLeadAssignedAt = now;

    return lead;
  }

  /**
   * Unassigns a lead, marking it as Unassigned and decrementing former employee count.
   */
  async unassignLead(lead: ILead, unassignedBy = 'Administrator'): Promise<ILead> {
    if (lead.assignedTo) {
      await User.findByIdAndUpdate(lead.assignedTo, { $inc: { assignedLeads: -1 } });
    }

    lead.assignedTo = null;
    lead.assignedEmployeeName = '';
    lead.assignedEmployeeEmail = '';
    lead.assignedAt = null;
    lead.assignmentStatus = 'Unassigned';

    lead.interactionHistory.unshift({
      employee: unassignedBy,
      action: 'Lead Unassigned',
      status: lead.status,
      remark: `Lead marked as unassigned by ${unassignedBy}.`,
      type: 'System',
      createdAt: new Date(),
    });

    await lead.save();
    return lead;
  }

  /**
   * Automatically distributes a batch of newly detected leads among active employees
   * using balanced round-robin rotation.
   */
  async distributeNewLeads(
    leads: ILead[]
  ): Promise<{
    assignedCount: number;
    unassignedCount: number;
    distributionSummary: Record<string, number>;
  }> {
    const activeEmployees = await this.getActiveEmployees();
    const distributionSummary: Record<string, number> = {};

    if (activeEmployees.length === 0) {
      // No active employees available: Keep all as Unassigned
      for (const lead of leads) {
        lead.assignmentStatus = 'Unassigned';
        lead.assignedTo = null;
        lead.assignedEmployeeName = '';
        lead.assignedEmployeeEmail = '';
        lead.assignedAt = null;
      }
      return {
        assignedCount: 0,
        unassignedCount: leads.length,
        distributionSummary,
      };
    }

    for (const emp of activeEmployees) {
      distributionSummary[emp.name] = 0;
    }

    let assignedCount = 0;
    const employeeIncrementMap = new Map<string, number>();
    const employeeLatestTimeMap = new Map<string, Date>();
    const now = Date.now();

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      // Pure round-robin sequential assignment
      const selectedEmp = activeEmployees[i % activeEmployees.length];
      const empId = selectedEmp._id.toString();
      const assignmentTimestamp = new Date(now - (leads.length - 1 - i) * 1000);

      lead.assignedTo = selectedEmp._id;
      lead.assignedEmployeeName = selectedEmp.name;
      lead.assignedEmployeeEmail = selectedEmp.email;
      lead.assignedAt = assignmentTimestamp;
      lead.assignmentStatus = 'Assigned';
      if (lead.status === 'New') {
        lead.status = 'Assigned';
      }

      lead.interactionHistory = [
        {
          employee: selectedEmp.name,
          employeeId: selectedEmp._id,
          action: 'Lead Assigned',
          status: lead.status,
          remark: `Auto-assigned to ${selectedEmp.name} via round-robin distribution.`,
          type: 'System',
          createdAt: assignmentTimestamp,
        },
      ];

      employeeIncrementMap.set(empId, (employeeIncrementMap.get(empId) || 0) + 1);
      employeeLatestTimeMap.set(empId, assignmentTimestamp);
      distributionSummary[selectedEmp.name] = (distributionSummary[selectedEmp.name] || 0) + 1;
      assignedCount++;
    }

    // Persist updated counters and lastLeadAssignedAt timestamps to database
    const updatePromises: Promise<any>[] = [];
    for (const [empId, count] of employeeIncrementMap.entries()) {
      const latestTime = employeeLatestTimeMap.get(empId);
      updatePromises.push(
        User.findByIdAndUpdate(empId, {
          $inc: { assignedLeads: count },
          $set: { lastLeadAssignedAt: latestTime || new Date() },
        })
      );
    }
    await Promise.all(updatePromises);

    return {
      assignedCount,
      unassignedCount: leads.length - assignedCount,
      distributionSummary,
    };
  }

  /**
   * Bulk auto-assigns currently unassigned leads to active employees via round-robin.
   */
  async autoAssignUnassignedLeads(
    limit = 100
  ): Promise<{
    assignedCount: number;
    distributionSummary: Record<string, number>;
  }> {
    const unassignedLeads = await Lead.find({ assignmentStatus: 'Unassigned' }).limit(limit);
    if (unassignedLeads.length === 0) {
      return { assignedCount: 0, distributionSummary: {} };
    }

    const activeEmployees = await this.getActiveEmployees();
    if (activeEmployees.length === 0) {
      return { assignedCount: 0, distributionSummary: {} };
    }

    const distributionSummary: Record<string, number> = {};
    for (const emp of activeEmployees) {
      distributionSummary[emp.name] = 0;
    }

    const employeeIncrementMap = new Map<string, number>();
    const employeeLatestTimeMap = new Map<string, Date>();
    let assignedCount = 0;
    const now = Date.now();

    for (let i = 0; i < unassignedLeads.length; i++) {
      const lead = unassignedLeads[i];
      const selectedEmp = activeEmployees[i % activeEmployees.length];
      const empId = selectedEmp._id.toString();
      const assignmentTimestamp = new Date(now - (unassignedLeads.length - 1 - i) * 1000);

      lead.assignedTo = selectedEmp._id;
      lead.assignedEmployeeName = selectedEmp.name;
      lead.assignedEmployeeEmail = selectedEmp.email;
      lead.assignedAt = assignmentTimestamp;
      lead.assignmentStatus = 'Assigned';
      if (lead.status === 'New') {
        lead.status = 'Assigned';
      }

      lead.interactionHistory.unshift({
        employee: selectedEmp.name,
        employeeId: selectedEmp._id,
        action: 'Lead Assigned',
        status: lead.status,
        remark: `Auto-assigned to ${selectedEmp.name} by bulk auto-distribution.`,
        type: 'System',
        createdAt: assignmentTimestamp,
      });

      await lead.save();

      employeeIncrementMap.set(empId, (employeeIncrementMap.get(empId) || 0) + 1);
      employeeLatestTimeMap.set(empId, assignmentTimestamp);
      distributionSummary[selectedEmp.name] = (distributionSummary[selectedEmp.name] || 0) + 1;
      assignedCount++;
    }

    for (const [empId, count] of employeeIncrementMap.entries()) {
      const latestTime = employeeLatestTimeMap.get(empId);
      await User.findByIdAndUpdate(empId, {
        $inc: { assignedLeads: count },
        $set: { lastLeadAssignedAt: latestTime || new Date() },
      });
    }

    return { assignedCount, distributionSummary };
  }
}

export const leadDistributionService = new LeadDistributionService();
