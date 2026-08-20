import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { leadService } from '../../../services/leadService';
import { Lead, EmployeeLeadCount, Priority } from '../../../types';
import { toast } from 'sonner';
import { UserPlus, Edit3, RefreshCw } from 'lucide-react';

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  employees?: EmployeeLeadCount[];
  onSuccess: () => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  open,
  onOpenChange,
  lead,
  employees = [],
  onSuccess,
}) => {
  const isEditing = !!lead;

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [assignedTo, setAssignedTo] = useState<string>('auto');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (lead) {
        setName(lead.name || '');
        setCompany(lead.company || '');
        setPhone(lead.phone || '');
        setEmail(lead.email || '');
        setLocation(lead.location || '');
        setPriority(lead.priority || 'Medium');
        setAssignedTo(lead.assignedTo || 'auto');
        setNotes(lead.notes || '');
        setNextFollowUpDate(lead.nextFollowUpDate ? lead.nextFollowUpDate.split('T')[0] : '');
        setNextFollowUpTime(lead.nextFollowUpTime || '');
      } else {
        setName('');
        setCompany('');
        setPhone('');
        setEmail('');
        setLocation('');
        setPriority('Medium');
        setAssignedTo('auto');
        setNotes('');
        setNextFollowUpDate('');
        setNextFollowUpTime('');
      }
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Lead name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && lead) {
        await leadService.updateLead(lead.id, {
          name: name.trim(),
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          location: location.trim() || undefined,
          priority: priority as Priority,
          notes: notes.trim() || undefined,
          nextFollowUpDate: nextFollowUpDate || null,
          nextFollowUpTime: nextFollowUpTime || null,
        });
        toast.success(`Lead "${name}" updated successfully.`);
      } else {
        await leadService.createLead({
          name: name.trim(),
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          location: location.trim() || undefined,
          priority: priority as Priority,
          assignedTo: assignedTo && assignedTo !== 'auto' ? assignedTo : undefined,
          notes: notes.trim() || undefined,
          nextFollowUpDate: nextFollowUpDate || undefined,
          nextFollowUpTime: nextFollowUpTime || undefined,
        });
        toast.success(`Lead "${name}" created successfully.`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Operation failed';
      toast.error('Error saving lead', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              {isEditing ? <Edit3 size={22} /> : <UserPlus size={22} />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? 'Edit Lead Details' : 'Add New Lead'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? 'Update contact details, company information, and notes.'
                  : 'Enter new lead information. Leads without an assigned employee will be auto-allocated.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name *
              </Label>
              <Input
                placeholder="e.g. John Doe"
                className="h-10 bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company / Organization
              </Label>
              <Input
                placeholder="e.g. Acme Corp"
                className="h-10 bg-background"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                City / Location
              </Label>
              <Input
                placeholder="e.g. Mumbai, MH"
                className="h-10 bg-background"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phone Number
              </Label>
              <Input
                placeholder="+91 98765 00000"
                className="h-10 bg-background"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input
                placeholder="john@example.com"
                type="email"
                className="h-10 bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isEditing && employees.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assign To
                </Label>
                <Select value={assignedTo} onValueChange={(val) => setAssignedTo(val || 'auto')}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Auto-Assign (Round Robin)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-Assign (Round Robin)</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.assignedCount} leads)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Next Follow-Up Date
              </Label>
              <Input
                type="date"
                className="h-10 bg-background"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-Up Time
              </Label>
              <Input
                type="time"
                className="h-10 bg-background"
                value={nextFollowUpTime}
                onChange={(e) => setNextFollowUpTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Initial Remarks / Notes
            </Label>
            <Textarea
              placeholder="Add any specific context, requirements, or meeting history..."
              className="resize-none min-h-[70px] bg-background text-xs"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  {isEditing ? 'Save Changes' : 'Create Lead'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
