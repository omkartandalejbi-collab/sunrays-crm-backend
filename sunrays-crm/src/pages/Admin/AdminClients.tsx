import React, { useState, useMemo } from 'react';
import { AdminFilterBar } from '../../components/admin/AdminFilterBar';
import { ClientTable } from '../../components/tables/ClientTable';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { Client } from '../../types';
import { mockClients } from '../../mock/clients';

import { Users } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/ui/badge';

export const AdminClients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const searchFilteredClients = useMemo(() => {
    return mockClients.filter(client => {
      const searchLower = searchQuery.toLowerCase();
      return !searchQuery || 
        client.name.toLowerCase().includes(searchLower) ||
        client.company.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(searchQuery);
    });
  }, [searchQuery]);

  const filteredClients = useMemo(() => {
    return searchFilteredClients.filter(client => {
      return statusFilter === 'all' || client.status === statusFilter;
    });
  }, [searchFilteredClients, statusFilter]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    const counts = { total: searchFilteredClients.length, Interested: 0, Converted: 0, Rejected: 0, New: 0, Contacted: 0 };
    searchFilteredClients.forEach(c => {
      if (c.status === 'Interested') counts.Interested++;
      if (c.status === 'Converted') counts.Converted++;
      if (c.status === 'Rejected') counts.Rejected++;
      if (c.status === 'New') counts.New++;
      if (c.status === 'Contacted') counts.Contacted++;
    });
    return counts;
  }, [searchFilteredClients]);

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsUpdateOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-dashboard-title">Clients Management</h1>
        <p className="text-body text-muted-foreground mt-1">Single source of truth for all CRM leads.</p>
      </div>

      <div className="bg-card border border-border p-3 rounded-xl shadow-sm">
        <AdminFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Showing</span>
        <Badge 
          variant="secondary" 
          className={`cursor-pointer transition-colors px-2 py-0.5 text-xs font-semibold ${statusFilter === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'}`}
          onClick={() => setStatusFilter('all')}
        >
          {summaryCounts.total} Clients
        </Badge>
        <div className="w-px h-4 bg-border mx-1" />
        {summaryCounts.Interested > 0 && (
          <Badge 
            variant="outline" 
            className={`cursor-pointer transition-colors text-xs ${statusFilter === 'Interested' ? 'bg-muted border-foreground/30 text-foreground' : 'text-muted-foreground border-border bg-card hover:bg-muted/50'}`}
            onClick={() => setStatusFilter('Interested')}
          >
            Interested <span className={`ml-1 font-medium ${statusFilter === 'Interested' ? 'text-foreground' : 'text-foreground'}`}>{summaryCounts.Interested}</span>
          </Badge>
        )}
        {summaryCounts.Converted > 0 && (
          <Badge 
            variant="outline" 
            className={`cursor-pointer transition-colors text-xs ${statusFilter === 'Converted' ? 'bg-success/10 border-success/30 text-success-foreground' : 'text-muted-foreground border-border bg-card hover:bg-muted/50'}`}
            onClick={() => setStatusFilter('Converted')}
          >
            Converted <span className={`ml-1 font-medium ${statusFilter === 'Converted' ? 'text-success-foreground' : 'text-success'}`}>{summaryCounts.Converted}</span>
          </Badge>
        )}
        {summaryCounts.Rejected > 0 && (
          <Badge 
            variant="outline" 
            className={`cursor-pointer transition-colors text-xs ${statusFilter === 'Rejected' ? 'bg-destructive/10 border-destructive/30 text-destructive-foreground' : 'text-muted-foreground border-border bg-card hover:bg-muted/50'}`}
            onClick={() => setStatusFilter('Rejected')}
          >
            Rejected <span className={`ml-1 font-medium ${statusFilter === 'Rejected' ? 'text-destructive-foreground' : 'text-destructive'}`}>{summaryCounts.Rejected}</span>
          </Badge>
        )}
        {summaryCounts.New > 0 && (
          <Badge 
            variant="outline" 
            className={`cursor-pointer transition-colors text-xs ${statusFilter === 'New' ? 'bg-blue-500/10 border-blue-500/30 text-blue-700' : 'text-muted-foreground border-border bg-card hover:bg-muted/50'}`}
            onClick={() => setStatusFilter('New')}
          >
            New <span className={`ml-1 font-medium ${statusFilter === 'New' ? 'text-blue-700' : 'text-blue-500'}`}>{summaryCounts.New}</span>
          </Badge>
        )}
        {summaryCounts.Contacted > 0 && (
          <Badge 
            variant="outline" 
            className={`cursor-pointer transition-colors text-xs ${statusFilter === 'Contacted' ? 'bg-orange-500/10 border-orange-500/30 text-orange-700' : 'text-muted-foreground border-border bg-card hover:bg-muted/50'}`}
            onClick={() => setStatusFilter('Contacted')}
          >
            Contacted <span className={`ml-1 font-medium ${statusFilter === 'Contacted' ? 'text-orange-700' : 'text-orange-500'}`}>{summaryCounts.Contacted}</span>
          </Badge>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {filteredClients.length > 0 ? (
          <ClientTable
            clients={filteredClients}
            onView={handleRowClick}
            onUpdate={handleEditClick}
            showEmployee={true}
          />
        ) : (
          <div className="h-[400px] border border-border rounded-[16px] bg-card flex flex-col items-center justify-center">
            <EmptyState
              title="No clients match your filters"
              description="Try adjusting your search query, status, or date range."
              icon={Users}
            />
            <div className="mt-4">
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-primary hover:underline"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

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
