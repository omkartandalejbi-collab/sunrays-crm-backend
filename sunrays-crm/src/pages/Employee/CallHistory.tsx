import React, { useState } from 'react';
import { CallHistoryTable } from '../../components/tables/CallHistoryTable';
import { mockCallHistory } from '../../mock/callHistory';
import { mockClients } from '../../mock/clients';
import { Button } from '../../components/ui/button';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export const CallHistory: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('all');

  // Simple filter simulation
  const filteredHistory = mockCallHistory.filter(call => {
    if (dateFilter === 'all') return true;
    const callDate = new Date(call.createdAt);
    const today = new Date();
    
    if (dateFilter === 'today') {
      return callDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'this-week') {
      const diff = today.getTime() - callDate.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === 'this-month') {
      return callDate.getMonth() === today.getMonth() && callDate.getFullYear() === today.getFullYear();
    }
    return true;
  });

  const handleExport = () => {
    toast.success('Exporting call history...', {
      description: `${filteredHistory.length} records will be downloaded as CSV.`,
    });
  };

  const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call History</h1>
          <p className="text-muted-foreground mt-1">Review all your previous calls and outcomes.</p>
        </div>
        <div className="sm:hidden">
          <Button variant="outline" className="w-full" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Log
          </Button>
        </div>
      </div>

      <div className="bg-card p-2 rounded-xl border shadow-sm flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setDateFilter(option.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg outline-none",
                dateFilter === option.id ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {dateFilter === option.id && (
                <motion.div
                  layoutId="callHistoryFilterIndicator"
                  className="absolute inset-0 bg-muted rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {option.label}
            </button>
          ))}
        </div>
        
        <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex text-muted-foreground">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="flex-1 mt-4">
        <CallHistoryTable history={filteredHistory} clients={mockClients} />
      </div>
    </div>
  );
};
