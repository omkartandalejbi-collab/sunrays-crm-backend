import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Client, Interaction } from '../../types';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { Building, Phone, Mail, CalendarDays, Clock, User, PhoneCall, PhoneIncoming, PhoneMissed, CalendarClock, History } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface ClientDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdate?: (updatedClient: Client) => void;
}

export const ClientDrawer: React.FC<ClientDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onClientUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('remarks');
  
  // Local state for the remark workspace
  const [currentRemark, setCurrentRemark] = useState('');
  
  // New call modal state
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [newCallType, setNewCallType] = useState('Outgoing');
  const [newCallOutcome, setNewCallOutcome] = useState('Interested');
  const [newCallDuration, setNewCallDuration] = useState('');
  const [newCallFollowUpDate, setNewCallFollowUpDate] = useState('');
  const [newCallFollowUpTime, setNewCallFollowUpTime] = useState('');
  const [newCallRemark, setNewCallRemark] = useState('');

  // Sync current remark when client changes
  useEffect(() => {
    if (client?.interactionHistory && client.interactionHistory.length > 0) {
      setCurrentRemark(client.interactionHistory[0].remark || '');
    } else {
      setCurrentRemark('');
    }
  }, [client]);

  if (!client) return null;

  const initials = client.name.substring(0, 2).toUpperCase();
  const interactions = client.interactionHistory || [];
  const historicalInteractions = interactions.slice(1);

  const handleUpdateRemark = () => {
    if (!client.interactionHistory || client.interactionHistory.length === 0) return;
    
    const updatedHistory = [...client.interactionHistory];
    updatedHistory[0] = {
      ...updatedHistory[0],
      remark: currentRemark,
    };
    
    if (onClientUpdate) {
      onClientUpdate({
        ...client,
        interactionHistory: updatedHistory,
      });
    }
  };

  const handleLogNewCall = () => {
    const newInteraction: Interaction = {
      id: `int-${Math.random().toString(36).substring(2, 9)}`,
      employee: 'Jane Doe', // Current user
      action: 'Call Logged',
      status: newCallOutcome,
      remark: newCallRemark,
      createdAt: new Date().toISOString(),
      type: newCallType as any,
      duration: newCallDuration,
      outcome: newCallOutcome,
      followUpDate: newCallFollowUpDate,
      followUpTime: newCallFollowUpTime,
    };
    
    const updatedHistory = [newInteraction, ...(client.interactionHistory || [])];
    
    if (onClientUpdate) {
      onClientUpdate({
        ...client,
        interactionHistory: updatedHistory,
      });
    }
    
    setIsNewCallModalOpen(false);
    
    // Reset form
    setNewCallType('Outgoing');
    setNewCallOutcome('Interested');
    setNewCallDuration('');
    setNewCallFollowUpDate('');
    setNewCallFollowUpTime('');
    setNewCallRemark('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(1000px,95vw)] sm:max-w-[1000px] h-[92vh] max-h-[92vh] p-0 flex flex-col gap-0 shadow-2xl bg-background overflow-hidden border-border rounded-2xl">
        
        {/* Fixed Header */}
        <div className="shrink-0 px-10 py-8 border-b border-border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <DialogHeader className="text-left space-y-0 relative z-10">
            <div className="flex items-start gap-6">
              <Avatar className="h-[84px] w-[84px] border-4 border-background shadow-md shrink-0">
                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <DialogTitle className="text-[28px] font-bold tracking-tight text-foreground truncate">{client.name}</DialogTitle>
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-3 mt-4">
                  <div className="flex items-center gap-2.5 text-[15px] text-muted-foreground font-medium">
                    <Building className="h-[18px] w-[18px] text-muted-foreground/70" /> 
                    <span>{client.company}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[15px] text-muted-foreground font-medium">
                    <Phone className="h-[18px] w-[18px] text-muted-foreground/70" /> 
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[15px] text-muted-foreground font-medium">
                    <Mail className="h-[18px] w-[18px] text-muted-foreground/70" /> 
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[15px] text-muted-foreground font-medium">
                    <User className="h-[18px] w-[18px] text-muted-foreground/70" /> 
                    <span>Assigned to {interactions[0]?.employee || 'Jane Doe'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border/60">
              <div className="flex items-center gap-3 bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 shadow-sm min-w-[200px]">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Next Follow Up</p>
                  {client.nextFollowUpDate ? (
                    <p className="text-[14px] font-bold text-foreground">
                      {format(parseISO(client.nextFollowUpDate), 'd MMM yyyy')}
                      {client.nextFollowUpTime && (
                        <span className="text-muted-foreground font-medium ml-1">at {client.nextFollowUpTime}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-[14px] font-medium text-muted-foreground">No follow up</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 shadow-sm min-w-[200px]">
                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Current Status</p>
                  <div className="mt-0.5"><StatusBadge status={client.status as any} /></div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 shadow-sm min-w-[200px]">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Last Contacted</p>
                  <p className="text-[14px] font-bold text-foreground">
                    {client.lastContactDate ? format(parseISO(client.lastContactDate), 'd MMM yyyy') : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Fixed Tabs */}
        <div className="shrink-0 px-10 border-b border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-14 bg-transparent p-0 gap-10">
              {['calls', 'remarks'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="relative data-[state=active]:shadow-none data-[state=active]:bg-transparent border-none rounded-none px-1 py-4 h-full text-[15px] font-semibold capitalize text-muted-foreground data-[state=active]:text-primary transition-colors hover:text-foreground tracking-wide"
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="drawer-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-background/50">
          <div className="p-10">
            <Tabs value={activeTab} className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >


                  <TabsContent value="remarks" className="mt-0 outline-none w-full">
                    {!isNewCallModalOpen ? (
                      <div className="bg-card border border-border shadow-sm rounded-[16px] p-6">
                        <h4 className="text-[16px] font-bold text-foreground mb-4">Current Working Remark</h4>
                        <Textarea
                          value={currentRemark}
                          onChange={(e) => setCurrentRemark(e.target.value)}
                          className="min-h-[60px] text-[15px] leading-relaxed resize-none bg-background focus-visible:ring-primary border-border p-4 mb-6"
                          placeholder="Type notes to remember before the next call..."
                        />
                        <div className="flex items-center gap-4">
                          <Button 
                            onClick={handleUpdateRemark} 
                            className="bg-primary text-white hover:bg-primary-hover h-11 px-6 shadow-sm"
                          >
                            Update Remark
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsNewCallModalOpen(true)}
                            className="h-11 px-6 border-border text-foreground hover:bg-muted shadow-sm"
                          >
                            Log New Call
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card border border-border shadow-sm rounded-[16px] p-6">
                        <h4 className="text-[18px] font-bold text-foreground mb-6">Log New Call</h4>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label>Call Type</Label>
                            <Select value={newCallType} onValueChange={(v) => setNewCallType(v as string)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Outgoing">Outgoing</SelectItem>
                                <SelectItem value="Incoming">Incoming</SelectItem>
                                <SelectItem value="Missed">Missed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Call Outcome</Label>
                            <Select value={newCallOutcome} onValueChange={(v) => setNewCallOutcome(v as string)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select outcome" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Interested">Interested</SelectItem>
                                <SelectItem value="Contacted">Contacted</SelectItem>
                                <SelectItem value="No Response">No Response</SelectItem>
                                <SelectItem value="Call Later">Call Later</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Duration (optional)</Label>
                            <Input 
                              placeholder="e.g., 08:12" 
                              value={newCallDuration}
                              onChange={(e) => setNewCallDuration(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Follow Up Date (optional)</Label>
                            <Input 
                              type="date"
                              value={newCallFollowUpDate}
                              onChange={(e) => setNewCallFollowUpDate(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                          <Label>Detailed Remark</Label>
                          <Textarea
                            value={newCallRemark}
                            onChange={(e) => setNewCallRemark(e.target.value)}
                            className="min-h-[150px] resize-none"
                            placeholder="Enter details of the call..."
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button onClick={handleLogNewCall} className="bg-primary text-white hover:bg-primary-hover h-11 px-8">
                            Save Interaction
                          </Button>
                          <Button variant="ghost" onClick={() => setIsNewCallModalOpen(false)} className="h-11 px-6">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="calls" className="mt-0 outline-none w-full">
                    {historicalInteractions.length > 0 ? (
                      <div className="space-y-6">
                        {historicalInteractions.map((call, idx) => (
                          <motion.div 
                            key={call.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border rounded-[16px] p-6 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border/60">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", 
                                  call.type === 'Outgoing' ? 'bg-blue-50 text-blue-600' : 
                                  call.type === 'Incoming' ? 'bg-emerald-50 text-emerald-600' : 
                                  call.type === 'Missed' ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground'
                                )}>
                                  {call.type === 'Outgoing' ? <PhoneCall className="h-5 w-5" /> :
                                   call.type === 'Incoming' ? <PhoneIncoming className="h-5 w-5" /> :
                                   call.type === 'Missed' ? <PhoneMissed className="h-5 w-5" /> :
                                   <History className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h4 className="text-[16px] font-bold text-foreground">{call.type || 'Interaction'}</h4>
                                  <div className="flex items-center gap-2 text-[14px] text-muted-foreground mt-0.5">
                                    <span>{format(parseISO(call.createdAt), 'MMMM d, yyyy')}</span>
                                    <span>•</span>
                                    <span>{format(parseISO(call.createdAt), 'h:mm a')}</span>
                                    {call.duration && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {call.duration}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <StatusBadge status={call.status as any} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                              <div>
                                <p className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Employee</p>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                                      {call.employee?.substring(0, 2).toUpperCase() || 'NA'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-[15px] font-medium text-foreground">{call.employee || 'Jane Doe'}</span>
                                </div>
                              </div>
                              {call.outcome && (
                                <div>
                                  <p className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Call Outcome</p>
                                  <p className="text-[15px] font-medium text-foreground">{call.outcome}</p>
                                </div>
                              )}
                            </div>

                            <div className="mb-4">
                              <p className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Detailed Remark</p>
                              <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                                <p className="text-[14px] leading-relaxed text-foreground whitespace-pre-wrap">
                                  {call.remark}
                                </p>
                              </div>
                            </div>

                            {call.followUpDate && (
                              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Next Follow Up</p>
                                  <p className="text-[14px] font-medium text-foreground">
                                    {format(parseISO(call.followUpDate), 'EEEE, MMM d, yyyy')}
                                    {call.followUpTime && ` at ${call.followUpTime}`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState 
                        icon={History} 
                        title="No historical calls" 
                        description="Previous interactions will appear here when new calls are logged."
                      />
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 p-6 border-t border-border bg-card flex items-center justify-end gap-3 z-10">
          <Button variant="outline" onClick={onClose} className="h-10 px-6 text-[15px] border-border text-foreground hover:bg-muted shadow-sm">
            Close
          </Button>
          <Button onClick={onClose} className="h-10 px-6 text-[15px] bg-primary text-white hover:bg-primary-hover shadow-sm">
            Done
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
