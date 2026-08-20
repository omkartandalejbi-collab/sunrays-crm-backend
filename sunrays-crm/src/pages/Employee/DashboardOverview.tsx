import React, { useState } from 'react';
import { Users, PhoneCall, CalendarClock, Trophy, AlertCircle, ArrowRight } from 'lucide-react';
import { StatisticCard } from '../../components/common/StatisticCard';
import { TaskCard } from '../../components/common/TaskCard';
import { WeeklyCallsChart } from '../../components/charts/WeeklyCallsChart';
import { CallDialog } from '../../components/common/CallDialog';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { LeadFunnelChart } from '../../components/charts/LeadFunnelChart';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

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

import { mockClients } from '../../mock/clients';
import { 
  mockDashboardStats, 
  mockWeeklyCalls
} from '../../mock/dashboard';
import { Client } from '../../types';

export const DashboardOverview: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('last30Days');

  const selectedLabel = timeRangeOptions.find(o => o.value === selectedTimeRange)?.label || 'Last 30 Days';

  const getMultiplier = (range: string) => {
    switch (range) {
      case 'today': return 0.05;
      case 'yesterday': return 0.08;
      case 'last7Days': return 0.25;
      case 'last30Days': return 1;
      case 'last2Months': return 2.1;
      case 'last3Months': return 3.2;
      case 'last6Months': return 6.5;
      case 'thisYear': return 10;
      default: return 1;
    }
  };

  const m = getMultiplier(selectedTimeRange);
  
  const currentStats = {
    assignedLeads: { ...mockDashboardStats.assignedLeads, count: Math.round(mockDashboardStats.assignedLeads.count * m) },
    callsCompleted: { ...mockDashboardStats.callsCompleted, count: Math.round(mockDashboardStats.callsCompleted.count * m) },
    pendingFollowUps: { ...mockDashboardStats.pendingFollowUps, count: Math.round(mockDashboardStats.pendingFollowUps.count * m) },
    conversionRate: { ...mockDashboardStats.conversionRate, count: Math.round(mockDashboardStats.conversionRate.count * m) },
  };

  const currentCalls = mockWeeklyCalls.map(item => ({ ...item, calls: Math.round(item.calls * m) }));

  const handleCall = (client: Client) => {
    setSelectedClient(client);
    setIsCallOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleUpdate = (client: Client) => {
    setSelectedClient(client);
    setIsUpdateOpen(true);
  };

  const todaysTasks = mockClients.slice(0, 3);
  const overdueFollowUps = mockClients.slice(3, 5);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-dashboard-title">Dashboard</h1>
          <p className="text-body text-muted-foreground mt-1">
            Showing performance for <span className="font-semibold text-foreground">{selectedLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={(val) => val && setSelectedTimeRange(val)}>
            <SelectTrigger className="w-[180px] h-10 bg-card border-border shadow-sm text-[14px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="custom" disabled>
                Custom Range <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-semibold tracking-wider">Coming Soon</span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10 px-4 border-border text-foreground rounded-lg font-medium shadow-sm hover:bg-muted">
            Export Report
          </Button>
          <Button className="h-10 px-4 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-primary-hover">
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatisticCard
          title="Assigned Leads"
          value={currentStats.assignedLeads.count}
          icon={Users}
          trend={{ value: currentStats.assignedLeads.percentage, isPositive: currentStats.assignedLeads.trend === 'up' }}
        />
        <StatisticCard
          title="Calls Completed"
          value={currentStats.callsCompleted.count}
          icon={PhoneCall}
          trend={{ value: currentStats.callsCompleted.percentage, isPositive: currentStats.callsCompleted.trend === 'up' }}
        />
        <StatisticCard
          title="Conversion Rate"
          value={`${Math.min(100, Math.max(5, Math.round(18.5 * (m > 1 ? 1 + Math.log10(m) : m))))}%`}
          icon={Trophy}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatisticCard
          title="Follow-ups Pending"
          value={currentStats.pendingFollowUps.count}
          icon={CalendarClock}
          trend={{ value: currentStats.pendingFollowUps.percentage, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
           <WeeklyCallsChart data={currentCalls} />
        </div>
        <div className="lg:col-span-1">
           <LeadFunnelChart />
        </div>
      </div>

      {/* Tasks Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Tasks Section */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {overdueFollowUps.length > 0 && (
            <div className="enterprise-card !p-0 overflow-hidden border-danger/30">
              <div className="p-4 border-b border-border bg-danger/5 flex items-center justify-between">
                <h3 className="text-card-title text-danger flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Overdue Tasks
                </h3>
              </div>
              <div className="divide-y divide-border">
                {overdueFollowUps.map(client => (
                  <div className="p-4" key={`overdue-${client.id}`}>
                    <TaskCard
                      client={client}
                      type="followup"
                      scheduledTime="Yesterday"
                      onCall={handleCall}
                      onView={handleView}
                      onUpdate={handleUpdate}
                      showLocationInsteadOfCompany={true}
                      className="border-none shadow-none !p-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="enterprise-card !p-0 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card">
              <h3 className="text-card-title">Today's Schedule</h3>
              <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-muted">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {todaysTasks.map(client => (
                <div className="p-5 hover:bg-muted/30 transition-colors" key={`today-${client.id}`}>
                  <TaskCard
                    client={client}
                    type="call"
                    scheduledTime={client.nextFollowUpTime || '02:00 PM'}
                    onCall={handleCall}
                    onView={handleView}
                    onUpdate={handleUpdate}
                    className="border-none shadow-none !p-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Common Dialogs */}
      <CallDialog 
        client={selectedClient} 
        isOpen={isCallOpen} 
        onClose={() => setIsCallOpen(false)} 
      />
      <ClientDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onClientUpdate={(updatedClient) => {
          setSelectedClient(updatedClient);
          const idx = mockClients.findIndex(c => c.id === updatedClient.id);
          if (idx !== -1) mockClients[idx] = updatedClient;
        }}
      />
      <UpdateStatusDialog
        client={selectedClient}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        onUpdate={(id, data) => console.log('Update', id, data)}
      />
    </div>
  );
};
