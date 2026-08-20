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
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { Employee, AppModuleId, AVAILABLE_MODULES } from '../../../types';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Clock,
  PhoneCall,
  UserCircle,
  FileText,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

interface ModuleAccessModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const moduleIconMap: Record<AppModuleId, React.ElementType> = {
  dashboard: LayoutDashboard,
  assignedClients: Users,
  followUps: Clock,
  callHistory: PhoneCall,
  attendance: CalendarCheck,
  profile: UserCircle,
  reports: FileText,
};

export const ModuleAccessModal: React.FC<ModuleAccessModalProps> = ({
  employee,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setSelectedModules(employee.allowedModules || ['dashboard', 'assignedClients', 'profile']);
    }
  }, [employee, open]);

  const toggleModule = (moduleId: AppModuleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedModules(AVAILABLE_MODULES.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    // Keep at least dashboard or profile
    setSelectedModules(['dashboard']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (selectedModules.length === 0) {
      toast.error('An employee must have access to at least one module.');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.updateModules(employee.id, selectedModules);
      toast.success(`Module access permissions updated for ${employee.name}`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update module permissions.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  const isAdmin = employee.role === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>Application Module Access</DialogTitle>
                <Badge
                  variant="outline"
                  className={
                    isAdmin
                      ? 'bg-primary/10 text-primary border-primary/20 text-xs'
                      : 'bg-muted text-muted-foreground border-border text-xs'
                  }
                >
                  {isAdmin ? 'Administrator' : 'Employee'}
                </Badge>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Configure module visibility and navigation privileges for{' '}
                <span className="font-medium text-foreground">{employee.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isAdmin ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80 my-2">
            <p className="font-medium text-primary mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Full Privileges Active
            </p>
            Users with the <strong className="text-foreground">Administrator</strong> role have
            unrestricted access to all current and future CRM modules by default.
          </div>
        ) : (
          <div className="flex items-center justify-between py-1 px-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {selectedModules.length} of {AVAILABLE_MODULES.length} modules enabled
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary px-2"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground px-2"
                onClick={handleDeselectAll}
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto space-y-2.5 pr-1 my-2 flex-1 scrollbar-thin">
            {AVAILABLE_MODULES.map((module) => {
              const Icon = moduleIconMap[module.id] || LayoutDashboard;
              const isEnabled = isAdmin ? true : selectedModules.includes(module.id);

              return (
                <div
                  key={module.id}
                  onClick={() => !isAdmin && toggleModule(module.id)}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                    isEnabled
                      ? 'border-primary/30 bg-primary/[0.03]'
                      : 'border-border bg-card hover:bg-muted/30'
                  } ${isAdmin ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 mt-0.5 ${
                        isEnabled
                          ? 'bg-primary text-white border-primary'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {module.label}
                        </span>
                        {module.id === 'reports' && (
                          <span className="text-[10px] font-medium uppercase tracking-wider bg-warning/10 text-warning px-1.5 py-0.2 rounded border border-warning/20">
                            Advanced
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => !isAdmin && toggleModule(module.id)}
                      disabled={isAdmin}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-3 shrink-0">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            {!isAdmin && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
