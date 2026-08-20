import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Check, MapPin, Clock, CalendarDays, Building2, Phone, Mail, User, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Client, Interaction } from '../../types';
import { cn, animations } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { EmptyState } from './EmptyState';
import { Activity } from 'lucide-react';

export interface UpdateStatusDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (clientId: string, data: any) => void;
}

const statusGroups = [
  { label: 'Active', options: ['New', 'Assigned', 'Contacted', 'Interested'] },
  { label: 'Scheduled', options: ['Follow Up Scheduled', 'Meeting Scheduled', 'Call Later'] },
  { label: 'Closed', options: ['Converted', 'Rejected'] },
  { label: 'Unreachable', options: ['Busy', 'No Response'] },
];

const rejectReasons = [
  'Too Expensive', 'No Budget', 'Already Purchased',
  'Wrong Contact', 'Competitor', 'Not Interested', 'Other'
];

const formSchema = z.object({
  status: z.string().min(1, { message: 'Please select a status' }),
  notes: z.string().min(1, { message: 'Please provide a detailed remark' }),
  
  nextFollowUpDate: z.date().optional(),
  nextFollowUpTime: z.string().optional(),
  
  meetingDate: z.date().optional(),
  meetingTime: z.string().optional(),
  meetingLocation: z.string().optional(),
  
  rejectReason: z.string().optional(),
  rejectOtherReason: z.string().optional(),
}).superRefine((data, ctx) => {
  if (['Interested', 'Follow Up Scheduled', 'Call Later', 'Busy'].includes(data.status)) {
    if (!data.nextFollowUpDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date is required', path: ['nextFollowUpDate'] });
  }
  if (data.status === 'Meeting Scheduled') {
    if (!data.meetingDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date is required', path: ['meetingDate'] });
    if (!data.meetingTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Time is required', path: ['meetingTime'] });
  }
  if (data.status === 'Rejected') {
    if (!data.rejectReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a reason', path: ['rejectReason'] });
    if (data.rejectReason === 'Other' && !data.rejectOtherReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please specify the reason', path: ['rejectOtherReason'] });
  }
});

type FormValues = z.infer<typeof formSchema>;

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  client,
  isOpen,
  onClose,
  onUpdate
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: client?.status || 'New',
      notes: '',
      rejectReason: '',
      rejectOtherReason: '',
      nextFollowUpTime: '10:00',
      meetingTime: '10:00',
    },
  });

  const selectedStatus = form.watch('status');
  const selectedRejectReason = form.watch('rejectReason');

  React.useEffect(() => {
    if (isOpen && client) {
      const latestRemark = client.interactionHistory?.[0]?.remark || '';
      form.reset({
        status: client.status,
        notes: latestRemark,
        nextFollowUpTime: '10:00',
        meetingTime: '10:00',
      });
    }
  }, [isOpen, client, form]);

  const onSubmit = (data: FormValues) => {
    if (client) {
      onUpdate(client.id, data);
      toast.success('Workspace updated successfully');
      onClose();
    }
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="w-full h-full sm:max-w-[90vw] sm:h-[85vh] lg:max-w-[1200px] lg:h-[90vh] p-0 overflow-hidden bg-card border-border shadow-2xl flex flex-col">
        {/* --- Header Section --- */}
        <div className="px-8 py-6 border-b bg-muted/10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <DialogHeader className="relative z-10 text-left">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                  {client.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  {client.name}
                  <StatusBadge status={client.status as any} />
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-foreground"><Building2 className="w-4 h-4 text-muted-foreground" /> {client.company}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {client.phone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {client.email}</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Assigned to: Jane Doe</span>
                  <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4" /> Joined {format(parseISO(client.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* --- Workspace Body --- */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Update Form (40%) */}
          <div className="w-full lg:w-[40%] h-full p-8 overflow-y-auto scrollbar-thin">
            <div className="mb-6">
              <h3 className="text-[16px] font-semibold text-foreground">Update Workspace</h3>
              <p className="text-sm text-muted-foreground">Log a new interaction and update the client's current status.</p>
            </div>

            <Form {...form}>
              <form id="update-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-[24px]">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] uppercase tracking-wider text-muted-foreground font-semibold">Current Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background border-border focus:ring-2 focus:ring-primary/20 text-[16px]">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusGroups.map((group) => (
                            <React.Fragment key={group.label}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 mt-1 first:mt-0">
                                {group.label}
                              </div>
                              {group.options.map((status) => (
                                <SelectItem key={status} value={status} className="pl-4 text-[15px]">{status}</SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode="popLayout">
                  {['Interested', 'Follow Up Scheduled', 'Call Later', 'Busy'].includes(selectedStatus) && (
                    <motion.div 
                      variants={animations.scaleUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="grid grid-cols-2 gap-4 p-5 rounded-xl bg-blue-50/50 border border-blue-100"
                    >
                      <div className="col-span-2 mb-1 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        <h4 className="text-[16px] font-semibold text-blue-900">Schedule Follow Up</h4>
                      </div>
                      <FormField
                        control={form.control}
                        name="nextFollowUpDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-[13px] uppercase tracking-wider text-blue-800 font-semibold">Date</FormLabel>
                            <Popover>
                              <PopoverTrigger>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn("h-12 pl-3 text-left font-normal bg-background text-[16px]", !field.value && "text-muted-foreground")}
                                  >
                                    {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date: Date) => date < new Date(new Date().setHours(0,0,0,0))} />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextFollowUpTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] uppercase tracking-wider text-blue-800 font-semibold">Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="time" className="h-12 bg-background pl-9 text-[16px]" {...field} />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {selectedStatus === 'Meeting Scheduled' && (
                    <motion.div variants={animations.scaleUp} initial="initial" animate="animate" exit="exit" className="space-y-[24px] p-5 rounded-xl bg-violet-50/50 border border-violet-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="h-4 w-4 text-violet-600" />
                        <h4 className="text-[16px] font-semibold text-violet-900">Meeting Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="meetingDate" render={({ field }) => (
                          <FormItem className="flex flex-col"><FormLabel className="text-[13px] uppercase tracking-wider text-violet-800 font-semibold">Date</FormLabel><Popover><PopoverTrigger><FormControl><Button variant={"outline"} className={cn("h-12 pl-3 text-left font-normal bg-background text-[16px]", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "MMM d, yyyy") : <span>Pick date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date: Date) => date < new Date(new Date().setHours(0,0,0,0))} /></PopoverContent></Popover><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meetingTime" render={({ field }) => (
                          <FormItem><FormLabel className="text-[13px] uppercase tracking-wider text-violet-800 font-semibold">Time</FormLabel><FormControl><div className="relative"><Input type="time" className="h-12 bg-background pl-9 text-[16px]" {...field} /><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="meetingLocation" render={({ field }) => (
                        <FormItem><FormLabel className="text-[13px] uppercase tracking-wider text-violet-800 font-semibold">Location / Link</FormLabel><FormControl><div className="relative"><Input placeholder="Zoom link or address" className="h-12 bg-background pl-9 text-[16px]" {...field} /><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div></FormControl><FormMessage /></FormItem>
                      )} />
                    </motion.div>
                  )}

                  {selectedStatus === 'Rejected' && (
                    <motion.div variants={animations.scaleUp} initial="initial" animate="animate" exit="exit" className="space-y-[24px] p-5 rounded-xl bg-red-50/50 border border-red-100">
                      <FormField control={form.control} name="rejectReason" render={({ field }) => (
                        <FormItem><FormLabel className="text-[13px] uppercase tracking-wider text-red-900 font-semibold">Reason for Rejection</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 bg-background border-red-200 text-[16px]"><SelectValue placeholder="Select a reason" /></SelectTrigger></FormControl>
                        <SelectContent>{rejectReasons.map(reason => <SelectItem key={reason} value={reason} className="text-[15px]">{reason}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )} />
                      {selectedRejectReason === 'Other' && (
                        <FormField control={form.control} name="rejectOtherReason" render={({ field }) => (
                          <FormItem><FormLabel className="text-[13px] uppercase tracking-wider text-red-900 font-semibold">Specify Reason</FormLabel><FormControl><Input className="h-12 bg-background border-red-200 text-[16px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] uppercase tracking-wider text-muted-foreground font-semibold">Call Remark</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write detailed notes about the conversation...
Examples:
• Client requested pricing deck.
• Wants callback tomorrow after 2 PM.
• Decision maker unavailable." 
                          className="resize-y min-h-[120px] bg-background text-[15px] leading-relaxed border-border focus:ring-2 focus:ring-primary/20 w-full" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Right Column: Timeline (60%) */}
          <div className="w-full lg:w-[60%] h-full p-8 overflow-y-auto scrollbar-thin bg-muted/10 border-t lg:border-t-0 lg:border-l border-border relative">
            <div className="mb-8 sticky top-0 bg-muted/90 backdrop-blur-sm z-20 py-2 border-b border-border/50">
              <h3 className="text-[16px] font-semibold text-foreground">Call History</h3>
              <p className="text-sm text-muted-foreground">Complete history of all client touchpoints.</p>
            </div>

            <div className="flex-1 pb-10">
              {client.interactionHistory && client.interactionHistory.length > 0 ? (
                <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
                  {client.interactionHistory.map((interaction: Interaction, idx: number) => (
                    <motion.div 
                      key={interaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative z-10"
                    >
                      <div className="absolute -left-[33px] mt-1.5">
                        <div className="h-[18px] w-[18px] rounded-full border-[3px] border-card bg-primary shadow-sm" />
                      </div>
                      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge status={interaction.status as any} />
                          <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {format(parseISO(interaction.createdAt), 'MMM d, yyyy')}
                            <span className="mx-1">•</span>
                            <Clock className="w-3.5 h-3.5" />
                            {format(parseISO(interaction.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        
                        <p className="text-[15px] text-foreground leading-relaxed mb-5 whitespace-pre-line">
                          {interaction.remark}
                        </p>

                        <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-muted text-[11px] font-bold text-foreground">{interaction.employee.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-semibold text-foreground">{interaction.employee}</span>
                          </div>
                          <span className="text-[12px] bg-muted px-2.5 py-1 rounded-md text-muted-foreground font-semibold uppercase tracking-wider">
                            {interaction.action}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="pt-10">
                  <EmptyState 
                    icon={Activity}
                    title="No previous interactions"
                    description="Start by updating this client using the form on the left."
                  />
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* --- Footer --- */}
        <DialogFooter className="px-8 py-5 border-t bg-card shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} className="border-border text-[15px] h-11 px-6">
            Cancel
          </Button>
          <Button type="submit" form="update-form" className="bg-primary hover:bg-primary/90 text-white shadow-sm text-[15px] h-11 px-8">
            <Check className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
