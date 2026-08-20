import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { attendanceService } from '../../../services/attendanceService';
import { AttendanceRecord, AttendanceStatus } from '../../../types/attendance';
import { Clock } from 'lucide-react';

interface EditAttendanceModalProps {
  record: AttendanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  record,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [workingHours, setWorkingHours] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      // Convert ISO to HH:mm for local time inputs
      if (record.checkIn) {
        const d = new Date(record.checkIn);
        setCheckInTime(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        );
      } else {
        setCheckInTime('');
      }

      if (record.checkOut) {
        const d = new Date(record.checkOut);
        setCheckOutTime(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        );
      } else {
        setCheckOutTime('');
      }

      setStatus(record.status || 'Present');
      setWorkingHours(record.workingHours || 0);
      setNotes(record.notes || '');
    }
  }, [record, open]);

  // Recalculate working hours whenever check-in / check-out times change
  useEffect(() => {
    if (checkInTime && checkOutTime && record?.date) {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);

      const inDate = new Date(`${record.date}T${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')}:00`);
      const outDate = new Date(`${record.date}T${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}:00`);

      const diffHours = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0) {
        const netHours = diffHours >= 5 ? Math.max(4, diffHours - 1) : diffHours;
        setWorkingHours(Math.round(netHours * 100) / 100);
      }
    }
  }, [checkInTime, checkOutTime, record?.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setIsSubmitting(true);
    try {
      let finalCheckIn: string | null = null;
      let finalCheckOut: string | null = null;

      if (checkInTime && record.date) {
        const d = new Date(`${record.date}T${checkInTime}:00`);
        finalCheckIn = d.toISOString();
      }

      if (checkOutTime && record.date) {
        const d = new Date(`${record.date}T${checkOutTime}:00`);
        finalCheckOut = d.toISOString();
      }

      await attendanceService.updateAttendance(record.id, {
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        status,
        workingHours: Number(workingHours) || 0,
        notes,
      });

      toast.success('Attendance record updated successfully.');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to update attendance record.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock size={20} />
            </div>
            <div>
              <DialogTitle>Edit Attendance Record</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Correct check-in, check-out, and attendance status for{' '}
                <span className="font-semibold text-foreground">{record.employee?.name || 'Employee'}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Date:</span>{' '}
              <span className="font-mono font-semibold text-foreground">{record.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>{' '}
              <span className="font-medium text-foreground">{record.employee?.department || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Check-In Time</Label>
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Check-Out Time</Label>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Attendance Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as AttendanceStatus)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Leave">On Leave</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Week Off">Week Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Working Hours</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={workingHours}
                onChange={(e) => setWorkingHours(Number(e.target.value))}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Correction Remarks / Reason</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved attendance manual override or clock-in correction"
              className="text-xs min-h-[70px] resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Correction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
