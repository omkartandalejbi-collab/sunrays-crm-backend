import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientTable } from '../../components/tables/ClientTable';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { LeadFormModal } from '../../components/admin/leads/LeadFormModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Download, Plus, RefreshCw } from 'lucide-react';
import { Client, LeadFilterParams } from '../../types';
import { leadService } from '../../services/leadService';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export const AssignedClients: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Fetch leads assigned to logged-in employee
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['employee-assigned-leads', searchQuery, statusFilter, priorityFilter, dateFilter],
    queryFn: async () => {
      const params: LeadFilterParams = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        limit: -1,
      };
      return leadService.getLeads(params);
    },
  });

  const leads = leadsResponse?.leads || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['employee-assigned-leads'] });
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleUpdate = (client: Client) => {
    setSelectedClient(client);
    setIsUpdateOpen(true);
  };

  const handleStatusUpdate = async (id: string, data: any) => {
    try {
      await leadService.updateLeadStatus(id, {
        status: data.status,
        remark: data.notes || data.remark || 'Status updated',
        followUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString() : null,
        followUpTime: data.nextFollowUpTime || null,
      });
      toast.success('Lead status updated successfully.');
      handleRefresh();
      setIsUpdateOpen(false);
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No assigned leads to export');
      return;
    }

    const headers = ['Name', 'Company', 'Phone', 'Email', 'Location', 'Status', 'Priority', 'Assigned Date'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.company || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.location || ''}"`,
      `"${l.status}"`,
      `"${l.priority || 'Medium'}"`,
      `"${l.assignedAt || l.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `my_assigned_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${leads.length} records to CSV.`);
  };

  const statuses = [
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
  const priorities = ['High', 'Medium', 'Low'];

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Assigned Leads</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage, contact, and schedule follow-ups for your active customer pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="sm:hidden w-full h-10 border-border" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            onClick={() => setIsAddLeadOpen(true)}
            className="hidden sm:flex bg-primary text-white hover:bg-primary-hover h-10 shadow-sm gap-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Summary status chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Badge
          variant="secondary"
          className={`cursor-pointer px-3 py-1 text-xs font-semibold ${
            statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary border-primary/20'
          }`}
          onClick={() => setStatusFilter('all')}
        >
          Total Assigned: {leadsResponse?.total ?? leads.length}
        </Badge>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        statuses={statuses}
        priorities={priorities}
        onExport={handleExport}
      />

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-[400px] border border-border rounded-xl bg-card flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-primary h-6 w-6" />
            <p className="text-sm font-medium text-muted-foreground">Loading your assigned leads...</p>
          </div>
        ) : leads.length > 0 ? (
          <ClientTable
            clients={leads}
            onView={handleView}
            onUpdate={handleUpdate}
            showEmployee={false}
          />
        ) : (
          <div className="h-[400px] border border-border rounded-[16px] bg-card flex flex-col items-center justify-center">
            <EmptyState
              title="No assigned leads match your filters"
              description="You have no leads matching the selected filter criteria. Try resetting your search or filters."
              icon={Users}
            />
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setDateFilter('all');
                }}
              >
                Reset all filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Common Dialogs */}
      <ClientDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onClientUpdate={(updatedClient) => {
          setSelectedClient(updatedClient);
          handleRefresh();
        }}
      />

      <UpdateStatusDialog
        client={selectedClient}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        onUpdate={handleStatusUpdate}
      />

      <LeadFormModal
        open={isAddLeadOpen}
        onOpenChange={setIsAddLeadOpen}
        lead={null}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
