import * as XLSX from 'xlsx';
import { Lead, ILead, LeadStatus, Priority } from '../models/Lead.js';
import { leadDistributionService } from './leadDistributionService.js';

export interface RawLeadRow {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
  status?: string;
  priority?: string;
  notes?: string;
  sheetRowId?: string;
  [key: string]: any;
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

export class SheetSyncService {
  /**
   * Normalizes header keys from Excel / CSV sheets to standard Lead field names.
   */
  normalizeRowKeys(row: Record<string, any>, rowIndex: number): RawLeadRow {
    const normalized: RawLeadRow = {};

    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const value = row[key] !== undefined && row[key] !== null ? String(row[key]).trim() : '';

      if (['name', 'fullname', 'leadname', 'clientname', 'contactname', 'customername'].includes(cleanKey)) {
        normalized.name = value;
      } else if (['company', 'companyname', 'organization', 'org', 'business', 'firm'].includes(cleanKey)) {
        normalized.company = value;
      } else if (['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contact', 'contactnumber', 'tel'].includes(cleanKey)) {
        normalized.phone = value;
      } else if (['email', 'emailaddress', 'emailid', 'mail'].includes(cleanKey)) {
        normalized.email = value.toLowerCase();
      } else if (['location', 'city', 'state', 'address', 'region', 'country'].includes(cleanKey)) {
        normalized.location = value;
      } else if (['status', 'leadstatus', 'stage'].includes(cleanKey)) {
        normalized.status = value;
      } else if (['priority', 'leadpriority', 'urgency'].includes(cleanKey)) {
        normalized.priority = value;
      } else if (['notes', 'note', 'remark', 'remarks', 'comment', 'comments', 'description'].includes(cleanKey)) {
        normalized.notes = value;
      } else if (['id', 'rowid', 'leadid', 'externalid', 'sheetid'].includes(cleanKey)) {
        normalized.sheetRowId = value;
      }
    }

    if (!normalized.sheetRowId) {
      normalized.sheetRowId = `row-${rowIndex + 1}-${normalized.email || normalized.phone || normalized.name || Math.random().toString(36).substr(2, 6)}`;
    }

    return normalized;
  }

  /**
   * Sanitizes and normalizes phone numbers for accurate deduplication.
   */
  sanitizePhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  }

  /**
   * Extracts Google Sheet ID from various possible Google Sheet URL formats.
   */
  extractGoogleSheetId(urlOrId: string): string {
    const trimmed = urlOrId.trim();
    if (!trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }

    const matches = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }

    return trimmed;
  }

  /**
   * Fetches data from a Google Sheet using the published CSV export endpoint.
   */
  async fetchGoogleSheetRows(sheetUrlOrId: string, sheetGid = '0'): Promise<RawLeadRow[]> {
    const sheetId = this.extractGoogleSheetId(sheetUrlOrId);
    let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;

    if (sheetUrlOrId.includes('pub?output=csv') || sheetUrlOrId.includes('gviz/tq?tqx=out:csv')) {
      csvUrl = sheetUrlOrId;
    }

    try {
      const response = await fetch(csvUrl, {
        headers: {
          'User-Agent': 'Sunrays-CRM-Backend-Sync/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Google Sheet (${response.status} ${response.statusText}). Ensure the sheet is shared as 'Anyone with link can view' or published to web.`
        );
      }

      const csvText = await response.text();
      return this.parseCsvString(csvText);
    } catch (error: any) {
      throw new Error(`Google Sheet fetch error: ${error.message}`);
    }
  }

  /**
   * Parses CSV string using SheetJS.
   */
  parseCsvString(csvText: string): RawLeadRow[] {
    const workbook = XLSX.read(csvText, { type: 'string', raw: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    return rawRows
      .map((row, index) => this.normalizeRowKeys(row, index))
      .filter((row) => (row.name && row.name.length > 0) || (row.email && row.email.length > 0) || (row.phone && row.phone.length > 0));
  }

  /**
   * Parses Excel / CSV buffer.
   */
  parseExcelBuffer(buffer: Buffer): RawLeadRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    return rawRows
      .map((row, index) => this.normalizeRowKeys(row, index))
      .filter((row) => (row.name && row.name.length > 0) || (row.email && row.email.length > 0) || (row.phone && row.phone.length > 0));
  }

  /**
   * Core synchronization logic:
   * 1. Detects new leads without duplicates.
   * 2. Checks MongoDB by email, phone, and external sheetRowId.
   * 3. Runs auto-assignment in balanced round-robin order for new leads.
   * 4. Stores leads in MongoDB and returns full sync statistics.
   */
  async syncLeads(
    rawRows: RawLeadRow[],
    sourceName = 'Google Sheet'
  ): Promise<SyncReport> {
    if (!rawRows || rawRows.length === 0) {
      return {
        totalRows: 0,
        newLeadsAdded: 0,
        duplicatesSkipped: 0,
        assignedCount: 0,
        unassignedCount: 0,
        employeeSummary: {},
        newLeadSamples: [],
      };
    }

    // 1. Fetch existing lead emails, phones, and sheetRowIds from MongoDB for deduplication
    const existingLeads = await Lead.find(
      {},
      { email: 1, phone: 1, sheetRowId: 1, name: 1 }
    ).lean();

    const existingEmailSet = new Set<string>();
    const existingPhoneSet = new Set<string>();
    const existingRowIdSet = new Set<string>();

    for (const lead of existingLeads) {
      if (lead.email) existingEmailSet.add(lead.email.toLowerCase().trim());
      if (lead.phone) existingPhoneSet.add(this.sanitizePhone(lead.phone));
      if (lead.sheetRowId) existingRowIdSet.add(lead.sheetRowId.trim());
    }

    const batchEmailSet = new Set<string>();
    const batchPhoneSet = new Set<string>();

    const newLeadDocs: ILead[] = [];
    let duplicatesSkipped = 0;

    const validStatuses: LeadStatus[] = [
      'New',
      'Assigned',
      'Contacted',
      'Interested',
      'Follow Up Scheduled',
      'Meeting Scheduled',
      'Converted',
      'Rejected',
      'Busy',
      'Call Later',
      'No Response',
    ];

    const validPriorities: Priority[] = ['High', 'Medium', 'Low'];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const name = row.name || `Lead #${i + 1}`;
      const email = row.email ? row.email.toLowerCase().trim() : '';
      const rawPhone = row.phone ? row.phone.trim() : '';
      const sanitizedPhone = this.sanitizePhone(rawPhone);
      const rowId = row.sheetRowId || `sheet-row-${i + 1}`;

      // Check if duplicate against DB or within this batch
      const isEmailDuplicate = email && (existingEmailSet.has(email) || batchEmailSet.has(email));
      const isPhoneDuplicate = sanitizedPhone && (existingPhoneSet.has(sanitizedPhone) || batchPhoneSet.has(sanitizedPhone));
      const isRowDuplicate = rowId && existingRowIdSet.has(rowId);

      if (isEmailDuplicate || isPhoneDuplicate || isRowDuplicate) {
        duplicatesSkipped++;
        continue;
      }

      // Mark as seen in this batch
      if (email) batchEmailSet.add(email);
      if (sanitizedPhone) batchPhoneSet.add(sanitizedPhone);

      let status: LeadStatus = 'New';
      if (row.status && validStatuses.includes(row.status as LeadStatus)) {
        status = row.status as LeadStatus;
      }

      let priority: Priority = 'Medium';
      if (row.priority && validPriorities.includes(row.priority as Priority)) {
        priority = row.priority as Priority;
      }

      const leadDoc = new Lead({
        name,
        company: row.company || '',
        phone: rawPhone,
        email,
        location: row.location || '',
        status,
        priority,
        source: sourceName,
        sheetRowId: rowId,
        notes: row.notes || '',
        assignmentStatus: 'Unassigned',
      });

      newLeadDocs.push(leadDoc);
    }

    if (newLeadDocs.length === 0) {
      return {
        totalRows: rawRows.length,
        newLeadsAdded: 0,
        duplicatesSkipped,
        assignedCount: 0,
        unassignedCount: 0,
        employeeSummary: {},
        newLeadSamples: [],
      };
    }

    // 2. Automatically assign newly added leads to active employees via balanced round-robin
    const distributionResult = await leadDistributionService.distributeNewLeads(newLeadDocs);

    // 3. Persist new leads to MongoDB
    await Lead.insertMany(newLeadDocs);

    const sampleLeads = newLeadDocs.slice(0, 5).map((l) => ({
      name: l.name,
      email: l.email || l.phone,
      assignedTo: l.assignedEmployeeName || 'Unassigned',
      status: l.status,
    }));

    return {
      totalRows: rawRows.length,
      newLeadsAdded: newLeadDocs.length,
      duplicatesSkipped,
      assignedCount: distributionResult.assignedCount,
      unassignedCount: distributionResult.unassignedCount,
      employeeSummary: distributionResult.distributionSummary,
      newLeadSamples: sampleLeads,
    };
  }
}

export const sheetSyncService = new SheetSyncService();
