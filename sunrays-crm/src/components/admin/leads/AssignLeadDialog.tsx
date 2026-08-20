import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { UserCheck, Sparkles, UserX, RefreshCw } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { Lead, EmployeeLeadCount } from '../../../types';
import { toast } from 'sonner';

interface AssignLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  employees: EmployeeLeadCount[];
  onSuccess: () => void;
}

export const AssignLeadDialog: React.FC<AssignLeadDialogProps> = ({
  open,
  onOpenChange,
  lead,
  employees,
  onSuccess,
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'specific' | 'auto' | 'unassign'>('specific');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    lead?.assignedTo || (employees[0]?.employeeId ?? '')
  );
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (lead) {
      if (lead.assignedTo) {
        setAssignmentMode('specific');
        setSelectedEmployeeId(lead.assignedTo);
      } else {
        setAssignmentMode('auto');
        if (employees.length > 0) {
          setSelectedEmployeeId(employees[0].employeeId);
        }
      }
      setNote('');
    }
  }, [lead, employees]);

  if (!lead) return null;

  const handleAssign = async () => {
    setIsLoading(true);

    try {
      if (assignmentMode === 'auto') {
        await leadService.assignLead(lead.id, {
          autoAssign: true,
          note: note.trim() || undefined,
        });
        toast.success(`Lead "${lead.name}" auto-assigned via round-robin distribution.`);
      } else if (assignmentMode === 'unassign') {
        await leadService.assignLead(lead.id, {
          employeeId: null,
          note: note.trim() || undefined,
        });
        toast.success(`Lead "${lead.name}" marked as unassigned.`);
      } else {
        await leadService.assignLead(lead.id, {
          employeeId: selectedEmployeeId,
          note: note.trim() || undefined,
        });
        const emp = employees.find((e) => e.employeeId === selectedEmployeeId);
        toast.success(`Lead "${lead.name}" assigned to ${emp?.name || 'employee'}.`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update assignment';
      toast.error('Assignment Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const activeEmployees = employees.filter((e) => e.status === 'Active' && e.isAccessEnabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Assign Lead</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Assign <strong className="text-foreground">{lead.name}</strong> ({lead.company || lead.email || lead.phone}) to a sales team member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Assignment Option Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assignment Method
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('specific')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  assignmentMode === 'specific'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <UserCheck size={18} className="mb-1" />
                <span className="text-xs">Specific User</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode('auto')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  assignmentMode === 'auto'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Sparkles size={18} className="mb-1" />
                <span className="text-xs">Auto Round-Robin</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode('unassign')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  assignmentMode === 'unassign'
                    ? 'border-destructive bg-destructive/10 text-destructive font-semibold ring-1 ring-destructive'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <UserX size={18} className="mb-1" />
                <span className="text-xs">Unassign</span>
              </button>
            </div>
          </div>

          {/* Specific Employee Selection List */}
          {assignmentMode === 'specific' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Active Employee
              </Label>
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-background scrollbar-thin">
                {employees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.employeeId;
                  const isActive = emp.status === 'Active' && emp.isAccessEnabled;

                  return (
                    <div
                      key={emp.employeeId}
                      onClick={() => setSelectedEmployeeId(emp.employeeId)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/40'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={emp.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {emp.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            {emp.name}
                            {!isActive && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted">
                                {emp.status}
                              </Badge>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-[11px] font-semibold">
                        {emp.assignedCount} leads
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {assignmentMode === 'auto' && (
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground/80 space-y-1">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <Sparkles size={14} /> Balanced Round-Robin Distribution
              </p>
              <p className="text-[11px] text-muted-foreground">
                This lead will be automatically assigned to the active sales employee who currently has the fewest assigned leads ({activeEmployees.length} active members available).
              </p>
            </div>
          )}

          {assignmentMode === 'unassign' && (
            <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-destructive space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <UserX size={14} /> Remove Assignment
              </p>
              <p className="text-[11px] text-muted-foreground">
                This lead will be moved to the unassigned queue and can be auto-distributed later.
              </p>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assignment Note / Remark (Optional)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Client requested follow-up from senior executive..."
              className="resize-none min-h-[65px] text-xs bg-background border-border"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleAssign}
            disabled={isLoading || (assignmentMode === 'specific' && !selectedEmployeeId)}
            className="gap-2 bg-primary text-white hover:bg-primary/90 font-semibold"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
