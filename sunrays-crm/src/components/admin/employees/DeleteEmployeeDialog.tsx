import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import { Employee } from '../../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
  employee,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!employee) return null;

  const isSelf = user?.id === employee.id;

  const handleDelete = async () => {
    if (isSelf) {
      toast.error('You cannot delete your own administrator account.');
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deleteEmployee(employee.id);
      toast.success(`Account for ${employee.name} has been deleted.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete employee account.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 rounded-2xl border border-border shadow-xl">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-destructive">Delete Employee Account</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 text-sm text-foreground/85 leading-relaxed">
          {isSelf ? (
            <p className="text-destructive font-medium">
              You are currently logged in with this account. You cannot delete your own
              administrator account.
            </p>
          ) : (
            <p>
              Are you sure you want to permanently delete the account for{' '}
              <strong className="text-foreground">{employee.name}</strong> ({employee.email})?
              All access privileges and credentials will be removed.
            </p>
          )}
        </div>

        {/* Clean Flush Footer */}
        <div className="px-6 py-4 mt-2 bg-muted/40 border-t border-border flex items-center justify-end gap-2.5">
          <DialogClose render={<Button variant="outline" type="button" className="h-9 px-4 text-xs font-medium" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isSelf}
            className="h-9 px-4 text-xs font-semibold shadow-sm"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
