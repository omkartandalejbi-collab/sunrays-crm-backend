import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RotateCcw, ChevronRight, UserPlus, Sliders, Shield } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { userService } from '../../services/userService';
import { Employee, Role } from '../../types';
import { mockEmployeePerformance } from '../../mock/employeePerformance';
import { EmployeeFormModal } from '../../components/admin/employees/EmployeeFormModal';
import { ModuleAccessModal } from '../../components/admin/employees/ModuleAccessModal';
import { ResetPasswordModal } from '../../components/admin/employees/ResetPasswordModal';
import { DeleteEmployeeDialog } from '../../components/admin/employees/DeleteEmployeeDialog';
import { StatusAccessToggle } from '../../components/admin/employees/StatusAccessToggle';
import { EmployeeActionsDropdown } from '../../components/admin/employees/EmployeeActionsDropdown';

export const AdminEmployees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Employee | null>(null);
  const [selectedForModules, setSelectedForModules] = useState<Employee | null>(null);
  const [selectedForPassword, setSelectedForPassword] = useState<Employee | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['admin-employees', searchQuery, departmentFilter, roleFilter, statusFilter],
    queryFn: async () => {
      try {
        const data = await userService.getEmployees({
          search: searchQuery || undefined,
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });
        if (data && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback to mock data if backend not reachable
      }
      return mockEmployeePerformance.map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        designation: emp.designation,
        role: 'employee' as Role,
        status: emp.status,
        isAccessEnabled: emp.status !== 'Offline',
        allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
        performanceScore: emp.performanceScore,
        assignedLeads: emp.assignedLeads,
        calls: emp.calls,
        meetings: emp.meetings,
        interested: emp.interested,
        converted: emp.converted,
        conversionRate: emp.conversionRate,
        avatarSeed: emp.avatarSeed,
      }));
    },
  });

  const handleReset = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        (emp.phone && emp.phone.includes(searchQuery));

      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, roleFilter, statusFilter]);

  const uniqueDepartments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department).filter(Boolean))].sort();
  }, [employees]);

  const getStatusBadge = (status: string, isAccessEnabled = true) => {
    if (!isAccessEnabled || status === 'Inactive') {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          Inactive
        </Badge>
      );
    }
    switch (status) {
      case 'Active':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Active
          </Badge>
        );
      case 'On Leave':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            On Leave
          </Badge>
        );
      case 'Offline':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
            Offline
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 80) return 'bg-primary';
    if (score >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      {/* Header & Add Employee Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Employee & User Management</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage user accounts, assign roles, configure application module access, and control permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 h-10 px-4 font-semibold shadow-sm shrink-0"
        >
          <UserPlus size={16} />
          Add Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border p-3 rounded-xl shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border h-10 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              if (val) setRoleFilter(val);
            }}
          >
            <SelectTrigger className="w-[140px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={departmentFilter}
            onValueChange={(val) => {
              if (val) setDepartmentFilter(val);
            }}
          >
            <SelectTrigger className="w-[160px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) setStatusFilter(val);
            }}
          >
            <SelectTrigger className="w-[150px] bg-card border-border h-10 shadow-sm text-[13px] font-medium">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-10 text-muted-foreground hover:text-foreground hidden sm:flex px-3"
            title="Reset Filters"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-auto max-h-full scrollbar-thin">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--border))]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-small-label text-muted-foreground h-11 min-w-[200px]">
                  Employee
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11">
                  Department
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11">
                  Role
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11">
                  Module Access
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11 min-w-[120px]">
                  Performance
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11">
                  Status
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11 text-center">
                  Access Toggle
                </TableHead>
                <TableHead className="text-small-label text-muted-foreground h-11 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                    Loading employee directory...
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => {
                  const isAdmin = emp.role === 'admin';
                  const modulesCount = emp.allowedModules?.length || 0;

                  return (
                    <TableRow
                      key={emp.id}
                      className="group hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/admin/employees/${emp.id}`)}
                    >
                      {/* Name & Email */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={emp.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {emp.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-foreground">
                              {emp.name}
                            </span>
                            <span className="text-[12px] text-muted-foreground">{emp.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department & Designation */}
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-foreground">
                            {emp.department || 'Sales'}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {emp.designation || 'Sales Executive'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            isAdmin
                              ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                              : 'bg-muted text-muted-foreground border-border font-medium'
                          }
                        >
                          {isAdmin ? (
                            <span className="flex items-center gap-1">
                              <Shield size={11} /> Admin
                            </span>
                          ) : (
                            'Employee'
                          )}
                        </Badge>
                      </TableCell>

                      {/* Module Access Badge / Trigger */}
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        {isAdmin ? (
                          <span className="text-[12px] text-muted-foreground font-medium">
                            Full Access
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1 rounded-md"
                            onClick={() => setSelectedForModules(emp)}
                            title="Click to manage module permissions"
                          >
                            <Sliders size={12} />
                            {modulesCount} Modules
                          </Button>
                        )}
                      </TableCell>

                      {/* Performance Bar */}
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5 w-full max-w-[100px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium">{emp.performanceScore ?? 80}</span>
                            <span className="text-[10px] text-muted-foreground">Score</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getPerformanceColor(
                                emp.performanceScore ?? 80
                              )}`}
                              style={{ width: `${emp.performanceScore ?? 80}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        {getStatusBadge(emp.status, emp.isAccessEnabled)}
                      </TableCell>

                      {/* Quick Access Switch */}
                      <TableCell className="py-3 text-center">
                        <div className="flex justify-center">
                          <StatusAccessToggle
                            employee={emp}
                            onStatusChange={() => invalidateEmployees()}
                          />
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10 h-8 px-2 text-xs"
                            onClick={() => navigate(`/dashboard/admin/employees/${emp.id}`)}
                          >
                            Details
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>

                          <EmployeeActionsDropdown
                            employee={emp}
                            onView={(e) => navigate(`/dashboard/admin/employees/${e.id}`)}
                            onEdit={(e) => setSelectedForEdit(e)}
                            onManageModules={(e) => setSelectedForModules(e)}
                            onResetPassword={(e) => setSelectedForPassword(e)}
                            onToggleStatus={(e) => {
                              userService
                                .toggleStatus(e.id, {
                                  isAccessEnabled: !e.isAccessEnabled,
                                  status: e.isAccessEnabled ? 'Inactive' : 'Active',
                                })
                                .then(() => invalidateEmployees());
                            }}
                            onDelete={(e) => setSelectedForDelete(e)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {!isLoading && filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No employees found matching the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <EmployeeFormModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        employee={null}
        onSuccess={() => invalidateEmployees()}
      />

      <EmployeeFormModal
        open={!!selectedForEdit}
        onOpenChange={(open) => !open && setSelectedForEdit(null)}
        employee={selectedForEdit}
        onSuccess={() => invalidateEmployees()}
      />

      <ModuleAccessModal
        open={!!selectedForModules}
        onOpenChange={(open) => !open && setSelectedForModules(null)}
        employee={selectedForModules}
        onSuccess={() => invalidateEmployees()}
      />

      <ResetPasswordModal
        open={!!selectedForPassword}
        onOpenChange={(open) => !open && setSelectedForPassword(null)}
        employee={selectedForPassword}
      />

      <DeleteEmployeeDialog
        open={!!selectedForDelete}
        onOpenChange={(open) => !open && setSelectedForDelete(null)}
        employee={selectedForDelete}
        onSuccess={() => invalidateEmployees()}
      />
    </div>
  );
};
