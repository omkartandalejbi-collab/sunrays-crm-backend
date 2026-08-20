import api from './api';
import {
  Lead,
  LeadStats,
  SyncReport,
  LeadFilterParams,
  LeadStatus,
  Priority,
} from '../types';

export interface CreateLeadPayload {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
  status?: LeadStatus;
  priority?: Priority;
  assignedTo?: string;
  notes?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
}

export interface UpdateLeadPayload {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
  priority?: Priority;
  notes?: string;
  nextFollowUpDate?: string | null;
  nextFollowUpTime?: string | null;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
  remark: string;
  type?: 'Outgoing' | 'Incoming' | 'Missed' | 'System';
  duration?: string;
  outcome?: string;
  followUpDate?: string | null;
  followUpTime?: string | null;
}

export interface AssignLeadPayload {
  employeeId?: string | null;
  autoAssign?: boolean;
  note?: string;
}

export interface SyncGoogleSheetPayload {
  sheetUrl?: string;
  sheetGid?: string;
}

export interface GetLeadsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  leads: Lead[];
}

export const leadService = {
  getLeads: async (params?: LeadFilterParams): Promise<GetLeadsResponse> => {
    const response = await api.get<GetLeadsResponse>('/leads', { params });
    return response.data;
  },

  getLeadStats: async (): Promise<LeadStats> => {
    const response = await api.get<{ success: boolean; stats: LeadStats }>('/leads/stats');
    return response.data.stats;
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const response = await api.get<{ success: boolean; lead: Lead }>(`/leads/${id}`);
    return response.data.lead;
  },

  createLead: async (data: CreateLeadPayload): Promise<Lead> => {
    const response = await api.post<{ success: boolean; message: string; lead: Lead }>(
      '/leads',
      data
    );
    return response.data.lead;
  },

  updateLead: async (id: string, data: UpdateLeadPayload): Promise<Lead> => {
    const response = await api.put<{ success: boolean; message: string; lead: Lead }>(
      `/leads/${id}`,
      data
    );
    return response.data.lead;
  },

  updateLeadStatus: async (id: string, data: UpdateLeadStatusPayload): Promise<Lead> => {
    const response = await api.patch<{ success: boolean; message: string; lead: Lead }>(
      `/leads/${id}/status`,
      data
    );
    return response.data.lead;
  },

  assignLead: async (id: string, payload: AssignLeadPayload): Promise<Lead> => {
    const response = await api.patch<{ success: boolean; message: string; lead: Lead }>(
      `/leads/${id}/assign`,
      payload
    );
    return response.data.lead;
  },

  syncGoogleSheet: async (payload: SyncGoogleSheetPayload): Promise<SyncReport> => {
    const response = await api.post<{ success: boolean; message: string; report: SyncReport }>(
      '/leads/sync/google-sheet',
      payload
    );
    return response.data.report;
  },

  syncExcel: async (file: File): Promise<SyncReport> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ success: boolean; message: string; report: SyncReport }>(
      '/leads/sync/excel',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.report;
  },

  syncExcelRows: async (rows: any[]): Promise<SyncReport> => {
    const response = await api.post<{ success: boolean; message: string; report: SyncReport }>(
      '/leads/sync/excel',
      { rows }
    );
    return response.data.report;
  },

  bulkAssignLeads: async (limit = 100): Promise<{ assignedCount: number; distributionSummary: Record<string, number> }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      assignedCount: number;
      distributionSummary: Record<string, number>;
    }>('/leads/bulk-assign', { limit });
    return response.data;
  },

  deleteLead: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/leads/${id}`);
    return response.data;
  },
};
