import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  PhoneCall,
  Calendar,
  Target,
  Percent,
  Activity,
  Mail,
  Phone,
  CalendarDays,
  Download,
  Edit2,
  Sliders,
  KeyRound,
  Shield,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { StatisticCard } from '../../components/common/StatisticCard';
import { ChartCard } from '../../components/common/ChartCard';
import { ClientTable } from '../../components/tables/ClientTable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { userService } from '../../services/userService';
import { Employee, Role } from '../../types';
import { mockEmployeePerformance } from '../../mock/employeePerformance';
import { mockClients } from '../../mock/clients';
import { EmployeeFormModal } from '../../components/admin/employees/EmployeeFormModal';
import { ModuleAccessModal } from '../../components/admin/employees/ModuleAccessModal';
import { ResetPasswordModal } from '../../components/admin/employees/ResetPasswordModal';
import { DeleteEmployeeDialog } from '../../components/admin/employees/DeleteEmployeeDialog';
import { StatusAccessToggle } from '../../components/admin/employees/StatusAccessToggle';

const timeRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7Days', label: 'Last 7 Days' },
  { value: 'last30Days', label: 'Last 30 Days' },
  { value: 'last2Months', label: 'Last 2 Months' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
];

export const AdminEmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTimeRange, setSelectedTimeRange] = useState('last30Days');

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: employee, isLoading } = useQuery<Employee | null>({
    queryKey: ['admin-employee-detail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const emp = await userService.getEmployeeById(id);
        if (emp) return emp;
      } catch {
        // Fallback to mock
      }
      const mock = mockEmployeePerformance.find((e) => e.id === id);
      if (mock) {
        return {
          id: mock.id,
          name: mock.name,
          email: mock.email,
          phone: mock.phone,
          department: mock.department,
          designation: mock.designation,
          role: 'employee' as Role,
          status: mock.status,
          isAccessEnabled: mock.status !== 'Offline',
          allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
          performanceScore: mock.performanceScore,
          assignedLeads: mock.assignedLeads,
          calls: mock.calls,
          meetings: mock.meetings,
          interested: mock.interested,
          converted: mock.converted,
          conversionRate: mock.conversionRate,
          avatarSeed: mock.avatarSeed,
          joiningDate: mock.joiningDate,
        };
      }
      return null;
    },
  });

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-employee-detail', id] });
    queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
  };

  const multiplier = useMemo(() => {
    const map: Record<string, number> = {
      today: 0.05,
      yesterday: 0.05,
      last7Days: 0.25,
      last30Days: 1,
      last2Months: 2.1,
      last3Months: 3.2,
      last6Months: 6.5,
      thisYear: 8.5,
    };
    return map[selectedTimeRange] || 1;
  }, [selectedTimeRange]);

  const assignedClients = useMemo(() => {
    return mockClients.slice(0, employee?.assignedLeads || 15).map((c) => ({
      ...c,
      assignedEmployeeId: employee?.id || '',
    }));
  }, [employee]);

  const dynamicMetrics = useMemo(() => {
    const rawTotalAssigned = assignedClients.length;
    const rawConvertedCount = assignedClients.filter((c) => c.status === 'Converted').length;
    const rawInterestedCount = assignedClients.filter((c) => c.status === 'Interested').length;

    const totalAssigned = Math.max(1, Math.round(rawTotalAssigned * multiplier));
    const convertedCount = Math.round(rawConvertedCount * multiplier);
    const interestedCount = Math.round(rawInterestedCount * multiplier);

    const conversionRate =
      totalAssigned > 0 ? ((convertedCount / totalAssigned) * 100).toFixed(2) : '0.00';

    return {
      totalAssigned,
      convertedCount,
      interestedCount,
      conversionRate,
    };
  }, [assignedClients, multiplier]);

  const mockPerf = useMemo(() => {
    return mockEmployeePerformance.find((e) => e.id === id) || mockEmployeePerformance[0];
  }, [id]);

  const scaledEmployee = useMemo(() => {
    if (!employee) return null;
    return {
      ...employee,
      calls: Math.round((employee.calls || mockPerf?.calls || 200) * multiplier),
      meetings: Math.round((employee.meetings || mockPerf?.meetings || 20) * multiplier),
      performanceHistory: (mockPerf?.performanceHistory || []).map((h) => ({
        ...h,
        value: Math.min(100, Math.max(0, Math.round(h.value * (0.9 + Math.random() * 0.2)))),
      })),
      conversionHistory: (mockPerf?.conversionHistory || []).map((h) => ({
        ...h,
        value: Math.round(h.value * multiplier),
      })),
    };
  }, [employee, multiplier, mockPerf]);

  const selectedLabel =
    timeRangeOptions.find((o) => o.value === selectedTimeRange)?.label || 'Last 30 Days';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-muted-foreground">
        Loading employee profile...
      </div>
    );
  }

  if (!employee || !scaledEmployee) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">Employee Not Found</h2>
        <Button onClick={() => navigate('/dashboard/admin/employees')}>Go Back</Button>
      </div>
    );
  }

  const isAdmin = employee.role === 'admin';

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
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard/admin/employees')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
              <AvatarImage src={employee.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {employee.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {employee.name}
                </h1>
                {getStatusBadge(employee.status, employee.isAccessEnabled)}
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
                      <Shield size={12} /> Administrator
                    </span>
                  ) : (
                    'Employee'
                  )}
                </Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {employee.designation || 'Sales Executive'} • {employee.department || 'Sales'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {employee.email}
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {employee.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {employee.joiningDate || 'Jan 15, 2023'}
                </div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {dynamicMetrics.totalAssigned} Active Clients
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit2 size={13} />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={() => setIsModulesOpen(true)}
          >
            <Sliders size={13} />
            Modules ({employee.allowedModules?.length || 0})
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium text-warning hover:bg-warning/10"
            onClick={() => setIsPasswordOpen(true)}
          >
            <KeyRound size={13} />
            Reset Password
          </Button>

          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium">Access:</span>
            <StatusAccessToggle employee={employee} onStatusChange={() => invalidateDetail()} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteOpen(true)}
            title="Delete Employee"
          >
            <Trash2 size={15} />
          </Button>

          <Select
            value={selectedTimeRange}
            onValueChange={(val) => val && setSelectedTimeRange(val)}
          >
            <SelectTrigger className="w-[150px] h-9 bg-card border-border shadow-sm text-xs font-medium">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatisticCard
          title="Assigned Clients"
          value={dynamicMetrics.totalAssigned}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          subtitle="vs last month"
        />
        <StatisticCard
          title="Calls Made"
          value={scaledEmployee.calls}
          icon={PhoneCall}
          trend={{ value: 8, isPositive: true }}
          subtitle="vs last period"
        />
        <StatisticCard
          title="Meetings Scheduled"
          value={scaledEmployee.meetings}
          icon={Calendar}
          trend={{ value: 2, isPositive: false }}
          subtitle="vs last period"
        />
        <StatisticCard
          title="Interested Leads"
          value={dynamicMetrics.interestedCount}
          icon={Target}
          trend={{ value: 15, isPositive: true }}
          subtitle="vs last period"
        />
        <StatisticCard
          title="Conversion Rate"
          value={`${dynamicMetrics.conversionRate}%`}
          icon={Percent}
          trend={{ value: 2.4, isPositive: true }}
          subtitle={`${dynamicMetrics.convertedCount} Conversions`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Performance Charts & Clients Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Performance Trend"
              subtitle={`Daily performance score (${selectedLabel})`}
              height={300}
              headerAction={
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={scaledEmployee.performanceHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPerf)"
                    name="Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Conversion History"
              subtitle={`Monthly clients converted (${selectedLabel})`}
              height={300}
              headerAction={
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scaledEmployee.conversionHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                    name="Conversions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Assigned Clients Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-semibold text-foreground">Assigned Clients</h3>
              <p className="text-sm text-muted-foreground">
                Recent leads managed by {employee.name.split(' ')[0]}
              </p>
            </div>
            <div className="flex-1 overflow-auto">
              <ClientTable
                clients={assignedClients}
                onView={() => {}}
                onUpdate={() => {}}
                showEmployee={false}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Performance Summary, Insights, Activity */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Performance Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span
                  className={`font-bold ${getPerformanceColor(
                    employee.performanceScore || scaledEmployee.performanceScore || 80
                  )}`}
                >
                  {employee.performanceScore || scaledEmployee.performanceScore || 80}/100
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Avg Calls / Day</span>
                <span className="font-medium text-foreground">
                  {Math.max(1, Math.round(scaledEmployee.calls / 22))}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Conversion Time</span>
                <span className="font-medium text-foreground">14 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Pipeline</span>
                <span className="font-medium text-foreground">
                  {dynamicMetrics.totalAssigned - dynamicMetrics.convertedCount} Leads
                </span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
              Manager Insights
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
              <li>Active CRM Role: <strong className="text-foreground capitalize">{employee.role}</strong></li>
              <li>Enabled Modules: <strong className="text-foreground">{employee.allowedModules?.length || 0} Modules</strong></li>
              <li>Account Status: <strong className="text-foreground">{employee.isAccessEnabled ? 'Access Enabled' : 'Deactivated'}</strong></li>
              <li>Currently handling {dynamicMetrics.totalAssigned} active clients.</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">Recent Activity</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {(mockPerf?.recentActivities || []).map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute left-[-29px] mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {act.action} <span className="text-primary">{act.target}</span>
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employee={employee}
        onSuccess={() => invalidateDetail()}
      />

      <ModuleAccessModal
        open={isModulesOpen}
        onOpenChange={setIsModulesOpen}
        employee={employee}
        onSuccess={() => invalidateDetail()}
      />

      <ResetPasswordModal
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        employee={employee}
        onSuccess={() => invalidateDetail()}
      />

      <DeleteEmployeeDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        employee={employee}
        onSuccess={() => navigate('/dashboard/admin/employees')}
      />
    </div>
  );
};
