import React, { useState } from 'react';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import { Employee, UserStatus } from '../../../types';

interface StatusAccessToggleProps {
  employee: Employee;
  onStatusChange?: (updated: Employee) => void;
}

export const StatusAccessToggle: React.FC<StatusAccessToggleProps> = ({
  employee,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSelf = user?.id === employee.id;

  const handleToggle = async (checked: boolean) => {
    if (isSelf && !checked) {
      toast.error('You cannot disable your own administrator access.');
      return;
    }

    setLoading(true);
    const newStatus: UserStatus = checked ? 'Active' : 'Inactive';

    try {
      const updated = await userService.toggleStatus(employee.id, {
        isAccessEnabled: checked,
        status: newStatus,
      });
      toast.success(
        checked
          ? `Access enabled for ${employee.name}`
          : `Access disabled for ${employee.name}`
      );
      onStatusChange?.(updated);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update account access status.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      title={
        isSelf
          ? 'Cannot disable your own administrator account'
          : employee.isAccessEnabled
          ? 'Click to disable access'
          : 'Click to enable access'
      }
    >
      <Switch
        checked={employee.isAccessEnabled && employee.status !== 'Inactive'}
        onCheckedChange={handleToggle}
        disabled={loading || isSelf}
      />
    </div>
  );
};
