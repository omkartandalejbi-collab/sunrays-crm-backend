import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import { Employee, Role, UserStatus, AVAILABLE_MODULES, AppModuleId } from '../../../types';
import { UserPlus, Edit2, Eye, EyeOff, Sparkles, Check } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  role: z.enum(['admin', 'employee']),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  phone: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Offline', 'Inactive']),
  isAccessEnabled: z.boolean(),
  allowedModules: z.array(z.string()).min(1, 'Select at least one module'),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployeeFormModalProps {
  employee: Employee | null; // null for Create, object for Edit
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (saved: Employee) => void;
}

const DEPARTMENTS = [
  'Sales',
  'Inside Sales',
  'Business Dev',
  'Enterprise Sales',
  'Marketing',
  'Management',
  'Customer Success',
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  employee,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const isEdit = !!employee;
  const isSelf = isEdit && user?.id === employee.id;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Sales',
      designation: 'Sales Executive',
      phone: '',
      status: 'Active',
      isAccessEnabled: true,
      allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
    },
  });

  const selectedModules = watch('allowedModules') || [];
  const selectedRole = watch('role');

  useEffect(() => {
    if (open) {
      if (employee) {
        reset({
          name: employee.name,
          email: employee.email,
          password: '',
          role: employee.role || 'employee',
          department: employee.department || 'Sales',
          designation: employee.designation || 'Sales Executive',
          phone: employee.phone || '',
          status: employee.status || 'Active',
          isAccessEnabled: employee.isAccessEnabled ?? true,
          allowedModules:
            employee.allowedModules && employee.allowedModules.length > 0
              ? employee.allowedModules
              : ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          department: 'Sales',
          designation: 'Sales Executive',
          phone: '',
          status: 'Active',
          isAccessEnabled: true,
          allowedModules: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
        });
      }
    }
  }, [employee, open, reset]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let pass = '';
    pass += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    pass += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    pass += '0123456789'[Math.floor(Math.random() * 10)];
    pass += '!@#$%&*'[Math.floor(Math.random() * 7)];
    for (let i = 4; i < 10; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    const shuffled = pass
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    setValue('password', shuffled, { shouldValidate: true });
    setShowPassword(true);
  };

  const toggleModuleChip = (moduleId: AppModuleId) => {
    const current = selectedModules;
    if (current.includes(moduleId)) {
      if (current.length === 1) {
        toast.error('At least one module must remain enabled.');
        return;
      }
      setValue(
        'allowedModules',
        current.filter((id) => id !== moduleId),
        { shouldValidate: true }
      );
    } else {
      setValue('allowedModules', [...current, moduleId], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEdit && (!data.password || data.password.length < 6)) {
      toast.error('Password must be at least 6 characters for a new account.');
      return;
    }

    try {
      if (isEdit && employee) {
        const updated = await userService.updateEmployee(employee.id, {
          name: data.name,
          email: data.email,
          role: data.role as Role,
          department: data.department,
          designation: data.designation,
          phone: data.phone || '',
          status: data.status as UserStatus,
          isAccessEnabled: data.isAccessEnabled,
          allowedModules: data.allowedModules,
        });
        toast.success(`Employee ${updated.name} updated successfully.`);
        onOpenChange(false);
        onSuccess?.(updated);
      } else {
        const created = await userService.createEmployee({
          name: data.name,
          email: data.email,
          password: data.password!,
          role: data.role as Role,
          department: data.department,
          designation: data.designation,
          phone: data.phone || '',
          status: data.status as UserStatus,
          isAccessEnabled: data.isAccessEnabled,
          allowedModules: data.allowedModules,
        });
        toast.success(`Account for ${created.name} created successfully.`);
        onOpenChange(false);
        onSuccess?.(created);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${isEdit ? 'update' : 'create'} employee.`;
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0 pb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {isEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Employee Account' : 'Add New Employee'}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEdit
                  ? `Update personal details, assigned role, and module permissions.`
                  : `Create a new user account with initial role and module permissions.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto space-y-4 pr-1 py-2 flex-1 scrollbar-thin">
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Rahul Sharma"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. rahul.s@sunrays.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password (Only required on Create) */}
            {!isEdit && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">
                    Initial Password <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-primary gap-1 px-1.5 font-medium"
                    onClick={generatePassword}
                  >
                    <Sparkles size={12} />
                    Generate
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password (min 6 chars)"
                    {...register('password')}
                    className={`pr-10 font-mono text-sm ${
                      errors.password ? 'border-destructive' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Role & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  User Role <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (isSelf && val !== 'admin') {
                          toast.error('You cannot remove your own administrator privileges.');
                          return;
                        }
                        if (val) field.onChange(val);
                      }}
                      disabled={isSelf}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Account Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (isSelf && val === 'Inactive') {
                          toast.error('You cannot deactivate your own administrator account.');
                          return;
                        }
                        if (val) {
                          field.onChange(val);
                          setValue('isAccessEnabled', val !== 'Inactive');
                        }
                      }}
                      disabled={isSelf}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                        <SelectItem value="Inactive">Inactive (Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Department & Designation Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => val && field.onChange(val)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="designation" className="text-xs">
                  Designation / Title
                </Label>
                <Input
                  id="designation"
                  placeholder="e.g. Sales Executive"
                  {...register('designation')}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="e.g. +91 98765 43210"
                {...register('phone')}
              />
            </div>

            {/* Allowed Modules Selection (Only if role is employee) */}
            {selectedRole === 'employee' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Accessible Modules</Label>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedModules.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_MODULES.map((module) => {
                    const isSelected = selectedModules.includes(module.id);
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => toggleModuleChip(module.id)}
                        className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                          isSelected
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <span className="truncate">{module.label}</span>
                        {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                {errors.allowedModules && (
                  <p className="text-xs text-destructive">{errors.allowedModules.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 shrink-0">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
