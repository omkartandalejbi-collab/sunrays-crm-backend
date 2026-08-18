import React, { useState, useMemo } from 'react';
import { ClientTable } from '../../components/tables/ClientTable';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Download, Plus } from 'lucide-react';
import { Client } from '../../types';
import { mockClients } from '../../mock/clients';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export const AssignedClients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleUpdate = (client: Client) => {
    setSelectedClient(client);
    setIsUpdateOpen(true);
  };

  const handleExport = () => {
    toast.success('Exporting clients data...', {
      description: `${filteredClients.length} records will be downloaded as CSV.`,
    });
  };

  const filteredClients = useMemo(() => {
    return mockClients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || client.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  const statuses = ['New', 'Assigned', 'Contacted', 'Interested', 'Follow Up Scheduled', 'Meeting Scheduled', 'Converted', 'Rejected', 'Busy', 'Call Later', 'No Response'];
  const priorities = ['High', 'Medium', 'Low'];

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title">Assigned Clients</h1>
          <p className="text-body text-muted-foreground mt-1">Manage and track your assigned leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="sm:hidden w-full h-10 border-border" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button className="hidden sm:flex bg-primary text-white hover:bg-primary-hover h-10 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statuses={statuses}
        priorities={priorities}
        onExport={handleExport}
      />

      <div className="flex-1 min-h-0">
        {filteredClients.length > 0 ? (
          <ClientTable
            clients={filteredClients}
            onView={handleView}
            onUpdate={handleUpdate}
          />
        ) : (
          <div className="h-[400px] border border-border rounded-[16px] bg-card flex items-center justify-center">
            <EmptyState
              title="No clients found"
              description="We couldn't find any clients matching your filters. Try adjusting your search query or filters."
              icon={Users}
            />
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
