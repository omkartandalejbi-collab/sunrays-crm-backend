import api from './api';
import { Employee, UserRole, UserStatus } from '../types';

export interface GetEmployeesParams {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  isAccessEnabled?: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  designation: string;
  phone: string;
  status: UserStatus;
  isAccessEnabled: boolean;
  allowedModules: string[];
}

export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  status?: UserStatus;
  isAccessEnabled?: boolean;
  allowedModules?: string[];
  performanceScore?: number;
}

export const userService = {
  getEmployees: async (params?: GetEmployeesParams): Promise<Employee[]> => {
    const response = await api.get<{ success: boolean; count: number; employees: Employee[] }>(
      '/admin/employees',
      { params }
    );
    return response.data.employees || [];
  },

  getAssignableEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get<{ success: boolean; count: number; employees: Employee[] }>(
        '/admin/employees/assignable'
      );
      if (response.data?.employees && response.data.employees.length > 0) {
        return response.data.employees;
      }
    } catch {
      // Fallback below
    }
    try {
      const all = await userService.getEmployees();
      if (all && all.length > 0) {
        return all.filter(e => e.role === 'employee' && e.isAccessEnabled !== false && e.status !== 'Inactive' && e.status !== 'Offline');
      }
    } catch {
      // Fallback below
    }
    const { mockEmployees } = await import('../mock/users');
    return mockEmployees.filter(e => e.role === 'employee' && e.isAccessEnabled !== false && e.status !== 'Inactive' && e.status !== 'Offline');
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get<{ success: boolean; employee: Employee }>(
      `/admin/employees/${id}`
    );
    return response.data.employee;
  },

  createEmployee: async (data: CreateEmployeePayload): Promise<Employee> => {
    const response = await api.post<{ success: boolean; message: string; employee: Employee }>(
      '/admin/employees',
      data
    );
    return response.data.employee;
  },

  updateEmployee: async (id: string, data: UpdateEmployeePayload): Promise<Employee> => {
    const response = await api.put<{ success: boolean; message: string; employee: Employee }>(
      `/admin/employees/${id}`,
      data
    );
    return response.data.employee;
  },

  deleteEmployee: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/employees/${id}`
    );
    return response.data;
  },

  toggleStatus: async (
    id: string,
    data: { isAccessEnabled?: boolean; status?: UserStatus }
  ): Promise<Employee> => {
    const response = await api.patch<{ success: boolean; message: string; employee: Employee }>(
      `/admin/employees/${id}/status`,
      data
    );
    return response.data.employee;
  },

  updateModules: async (id: string, allowedModules: string[]): Promise<Employee> => {
    const response = await api.patch<{ success: boolean; message: string; employee: Employee }>(
      `/admin/employees/${id}/modules`,
      { allowedModules }
    );
    return response.data.employee;
  },

  resetPassword: async (
    id: string,
    newPassword: string,
    forcePasswordReset = false
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/admin/employees/${id}/reset-password`,
      { newPassword, forcePasswordReset }
    );
    return response.data;
  },
};
