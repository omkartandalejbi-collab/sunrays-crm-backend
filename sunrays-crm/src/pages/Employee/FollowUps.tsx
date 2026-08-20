import React, { useState } from 'react';
import { FollowUpCard } from '../../components/common/FollowUpCard';
import { MoreHorizontal } from 'lucide-react';
import { CallDialog } from '../../components/common/CallDialog';
import { ClientDrawer } from '../../components/common/ClientDrawer';
import { UpdateStatusDialog } from '../../components/common/UpdateStatusDialog';
import { mockFollowUps } from '../../mock/followups';
import { mockClients } from '../../mock/clients';
import { Client, FollowUp } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { animations, cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export const FollowUps: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleCall = (client: Client) => {
    setSelectedClient(client);
    setIsCallOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };


  const handleComplete = (_followUp: FollowUp) => {
    toast.success('Follow up marked as completed');
  };

  const handleReschedule = (followUp: FollowUp) => {
    const client = getClient(followUp.clientId);
    if (client) {
      setSelectedClient(client);
      setIsUpdateOpen(true);
    }
  };

  const getClient = (clientId: string) => mockClients.find(c => c.id === clientId) as Client;

  // Categorize follow-ups
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  
  const dayAfterTomorrowStart = new Date(todayStart);
  dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 2);

  const todayFollowUps = mockFollowUps.filter(f => {
    const d = new Date(f.scheduledDate);
    return d >= todayStart && d < tomorrowStart;
  });

  const tomorrowFollowUps = mockFollowUps.filter(f => {
    const d = new Date(f.scheduledDate);
    return d >= tomorrowStart && d < dayAfterTomorrowStart;
  });

  const upcomingFollowUps = mockFollowUps.filter(f => {
    const d = new Date(f.scheduledDate);
    return d >= dayAfterTomorrowStart;
  });

  const overdueFollowUps = mockFollowUps.filter(f => {
    const d = new Date(f.scheduledDate);
    return d < todayStart && f.status !== 'completed';
  });

  const KanbanColumn = ({ title, count, items, isOverdue = false }: { title: string, count: number, items: FollowUp[], isOverdue?: boolean }) => {
    return (
      <div className="flex flex-col bg-muted/30 rounded-[16px] border border-border overflow-hidden h-[calc(100vh-180px)]">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className={cn("text-[15px] font-semibold", isOverdue ? "text-danger" : "text-foreground")}>
              {title}
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-semibold",
              isOverdue && count > 0 ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((f, i) => (
                <motion.div 
                  key={f.id} 
                  variants={animations.slideUp} 
                  initial="initial" 
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <FollowUpCard 
                    followUp={f} 
                    client={getClient(f.clientId)} 
                    onCall={handleCall}
                    onView={handleView}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {items.length === 0 && (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-[12px] opacity-60">
                <span className="text-[13px] font-medium">No tasks</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-6 w-full max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-dashboard-title">Follow Ups</h1>
          <p className="text-body text-muted-foreground mt-1">Manage your pipeline and scheduled calls.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 border-border text-foreground rounded-lg font-medium shadow-sm hover:bg-muted">
            Filter View
          </Button>
          <Button className="h-10 px-4 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-primary-hover">
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 flex-1 min-h-0">
        <KanbanColumn title="Overdue" count={overdueFollowUps.length} items={overdueFollowUps} isOverdue={true} />
        <KanbanColumn title="Today" count={todayFollowUps.length} items={todayFollowUps} />
        <KanbanColumn title="Tomorrow" count={tomorrowFollowUps.length} items={tomorrowFollowUps} />
        <KanbanColumn title="Upcoming" count={upcomingFollowUps.length} items={upcomingFollowUps} />
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
