import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { UserCircle, Mail, Phone, Building2, Briefcase, Shield } from 'lucide-react';

interface EditProfileModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success('Your profile has been updated.');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update profile.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0 rounded-2xl border border-border shadow-xl">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <UserCircle size={24} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">Edit Profile Details</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update your personal contact information.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-3 space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-background h-10"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone" className="text-xs font-medium text-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-9 bg-background h-10"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Read-Only Account Details Container */}
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
              <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                Organizational Details (Managed by Admin)
              </p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail size={13} className="shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={13} className="shrink-0 text-primary" />
                  <span className="capitalize text-foreground font-medium">{user.role}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} className="shrink-0 text-muted-foreground" />
                  <span>{user.department || 'Sales'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={13} className="shrink-0 text-muted-foreground" />
                  <span>{user.designation || 'Sales Executive'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Flush Footer */}
          <div className="px-6 py-4 mt-2 bg-muted/40 border-t border-border flex items-center justify-end gap-2.5">
            <DialogClose render={<Button variant="outline" type="button" className="h-9 px-4 text-xs font-medium" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="h-9 px-4 text-xs font-semibold shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
