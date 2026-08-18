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
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { Employee } from '../../../types';
import { KeyRound, Eye, EyeOff, Sparkles, Copy, Check } from 'lucide-react';

interface ResetPasswordModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  employee,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forceReset, setForceReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let pass = '';
    pass += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    pass += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    pass += '0123456789'[Math.floor(Math.random() * 10)];
    pass += '!@#$%&*'[Math.floor(Math.random() * 7)];
    for (let i = 4; i < 12; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    const shuffled = pass
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    setNewPassword(shuffled);
    setShowPassword(true);
  };

  const handleCopy = async () => {
    if (!newPassword) return;
    await navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.success('Password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.resetPassword(employee.id, newPassword, forceReset);
      toast.success(`Password reset successfully for ${employee.name}`);
      setNewPassword('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to reset password.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden gap-0 rounded-2xl border border-border shadow-xl">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <KeyRound size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">Reset Password</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set a new password for <span className="font-medium text-foreground">{employee.name}</span> ({employee.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-3 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password" className="text-xs font-medium">New Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary gap-1 px-2 font-medium"
                  onClick={generatePassword}
                >
                  <Sparkles size={13} />
                  Generate Secure Password
                </Button>
              </div>

              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-20 font-mono text-sm bg-background h-10"
                  required
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {newPassword && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={handleCopy}
                      title="Copy Password"
                    >
                      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="forceReset"
                checked={forceReset}
                onCheckedChange={(checked) => setForceReset(checked === true)}
              />
              <Label
                htmlFor="forceReset"
                className="text-xs text-muted-foreground font-normal leading-snug cursor-pointer select-none"
              >
                Require employee to change password upon next login
              </Label>
            </div>
          </div>

          {/* Clean Flush Footer */}
          <div className="px-6 py-4 mt-2 bg-muted/40 border-t border-border flex items-center justify-end gap-2.5">
            <DialogClose render={<Button variant="outline" type="button" className="h-9 px-4 text-xs font-medium" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !newPassword} className="h-9 px-4 text-xs font-semibold shadow-sm">
              {isSubmitting ? 'Resetting...' : 'Save New Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
