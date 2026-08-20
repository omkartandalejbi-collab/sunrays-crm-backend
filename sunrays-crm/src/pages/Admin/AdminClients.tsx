import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminFilterBar } from '../../components/admin/AdminFilterBar';
import { ClientTable } from '../../components/tables/ClientTable';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { EmployeeLeadStatsBar } from '../../components/admin/leads/EmployeeLeadStatsBar';
import { GoogleSheetSyncModal } from '../../components/admin/leads/GoogleSheetSyncModal';
import { ExcelImportModal } from '../../components/admin/leads/ExcelImportModal';
import { AssignLeadDialog } from '../../components/admin/leads/AssignLeadDialog';
import { LeadFormModal } from '../../components/admin/leads/LeadFormModal';
import { Client, LeadStats, LeadFilterParams } from '../../types';
import { leadService } from '../../services/leadService';
import { Users, FileSpreadsheet, Upload, UserPlus, Download, RefreshCw } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export const AdminClients: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Modals state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isGoogleSheetOpen, setIsGoogleSheetOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // 1. Fetch live leads with active filters
  const { data: leadsResponse, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['admin-leads', searchQuery, statusFilter, assignmentFilter, employeeFilter, dateFilter],
    queryFn: async () => {
      const params: LeadFilterParams = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        assignmentStatus: assignmentFilter !== 'all' ? assignmentFilter : undefined,
        employeeId: employeeFilter !== 'all' ? employeeFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        limit: -1, // Get all matching leads
      };
      return leadService.getLeads(params);
    },
  });

  // 2. Fetch live lead statistics (employee breakdown, status counts, unassigned counts)
  const { data: stats } = useQuery<LeadStats>({
    queryKey: ['admin-lead-stats'],
    queryFn: () => leadService.getLeadStats(),
  });

  const leads = leadsResponse?.leads || [];

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setAssignmentFilter('all');
    setEmployeeFilter('all');
    setDateFilter('all');
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    queryClient.invalidateQueries({ queryKey: ['admin-lead-stats'] });
  };

  const handleBulkAssign = async () => {
    setIsBulkAssigning(true);
    try {
      const result = await leadService.bulkAssignLeads();
      toast.success('Auto-Distribution Complete!', {
        description: `Successfully auto-assigned ${result.assignedCount} leads to active sales employees.`,
      });
      handleRefreshAll();
    } catch (error: any) {
      toast.error('Auto-distribution failed', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsBulkAssigning(false);
    }
  };

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsUpdateOpen(true);
  };

  const handleAssignClick = (client: Client) => {
    setSelectedClient(client);
    setIsAssignOpen(true);
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
      handleRefreshAll();
      setIsUpdateOpen(false);
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Company', 'Phone', 'Email', 'Location', 'Status', 'Assignment Status', 'Assigned Employee', 'Created Date'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.company || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.location || ''}"`,
      `"${l.status}"`,
      `"${l.assignmentStatus || 'Unassigned'}"`,
      `"${l.assignedEmployeeName || 'Unassigned'}"`,
      `"${l.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${leads.length} leads to CSV.`);
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Lead Management</h1>
          <p className="text-body text-muted-foreground mt-1">
            Single source of truth for CRM leads, Google Sheet sync, and automated employee distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGoogleSheetOpen(true)}
            className="gap-1.5 h-9 font-medium text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 bg-card shadow-xs"
          >
            <FileSpreadsheet size={15} />
            Sync Google Sheet
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExcelOpen(true)}
            className="gap-1.5 h-9 font-medium text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 bg-card shadow-xs"
          >
            <Upload size={15} />
            Import Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 h-9 font-medium text-xs border-border bg-card hover:bg-muted shadow-xs hidden sm:flex"
          >
            <Download size={14} />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsLeadFormOpen(true)}
            className="gap-1.5 h-9 font-semibold text-xs bg-primary text-white hover:bg-primary/90 shadow-sm"
          >
            <UserPlus size={15} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Employee Lead Assignment Stats Bar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm">
        <EmployeeLeadStatsBar
          stats={stats || null}
          selectedEmployeeId={employeeFilter}
          onSelectEmployee={(empId) => setEmployeeFilter(empId)}
          onBulkAssign={handleBulkAssign}
          isBulkAssigning={isBulkAssigning}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border p-3 rounded-xl shadow-sm">
        <AdminFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          assignmentFilter={assignmentFilter}
          onAssignmentChange={setAssignmentFilter}
          employeeFilter={employeeFilter}
          onEmployeeChange={setEmployeeFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          employees={stats?.employeeLeadCounts || []}
          onReset={handleReset}
        />
      </div>

      {/* Status Chips Summary */}
      {stats && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</span>
          <Badge
            variant="secondary"
            className={`cursor-pointer transition-colors px-2.5 py-0.5 text-xs font-semibold ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            All ({leadsResponse?.total ?? leads.length})
          </Badge>

          {Object.entries(stats.statusCounts)
            .filter(([_, count]) => count > 0)
            .map(([statusName, count]) => {
              const isSelected = statusFilter === statusName;
              return (
                <Badge
                  key={statusName}
                  variant="outline"
                  className={`cursor-pointer transition-colors text-xs font-medium ${
                    isSelected
                      ? 'bg-muted border-foreground/30 text-foreground font-bold'
                      : 'text-muted-foreground border-border bg-card hover:bg-muted/50'
                  }`}
                  onClick={() => setStatusFilter(isSelected ? 'all' : statusName)}
                >
                  {statusName} <span className="ml-1 font-semibold text-foreground">{count}</span>
                </Badge>
              );
            })}
        </div>
      )}

      {/* Leads Table View */}
      <div className="flex-1 min-h-0">
        {isLoadingLeads ? (
          <div className="h-[400px] border border-border rounded-xl bg-card flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-primary h-6 w-6" />
            <p className="text-sm font-medium text-muted-foreground">Loading leads from database...</p>
          </div>
        ) : leads.length > 0 ? (
          <ClientTable
            clients={leads}
            onView={handleRowClick}
            onUpdate={handleEditClick}
            onAssign={handleAssignClick}
            showEmployee={true}
          />
        ) : (
          <div className="h-[400px] border border-border rounded-xl bg-card flex flex-col items-center justify-center">
            <EmptyState
              title="No leads match your filters"
              description="Try adjusting your search query, employee, or status filter, or sync new leads from Google Sheets."
              icon={Users}
            />
            <div className="mt-4 flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                Reset all filters
              </Button>
              <Button
                size="sm"
                onClick={() => setIsGoogleSheetOpen(true)}
                className="text-xs gap-1.5 bg-primary text-white"
              >
                <FileSpreadsheet size={14} />
                Sync Google Sheet
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer & Dialogs */}
      <ClientDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onClientUpdate={(updatedClient) => {
          setSelectedClient(updatedClient);
          handleRefreshAll();
        }}
      />

      <UpdateStatusDialog
        client={selectedClient}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        onUpdate={handleStatusUpdate}
      />

      <AssignLeadDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        lead={selectedClient}
        employees={stats?.employeeLeadCounts || []}
        onSuccess={handleRefreshAll}
      />

      <GoogleSheetSyncModal
        open={isGoogleSheetOpen}
        onOpenChange={setIsGoogleSheetOpen}
        onSyncComplete={handleRefreshAll}
      />

      <ExcelImportModal
        open={isExcelOpen}
        onOpenChange={setIsExcelOpen}
        onImportComplete={handleRefreshAll}
      />

      <LeadFormModal
        open={isLeadFormOpen}
        onOpenChange={setIsLeadFormOpen}
        lead={null}
        employees={stats?.employeeLeadCounts || []}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
};
