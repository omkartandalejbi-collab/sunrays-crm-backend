import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { Employee } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import {
  MoreVertical,
  Edit2,
  Sliders,
  KeyRound,
  Power,
  Trash2,
  Eye,
} from 'lucide-react';

interface EmployeeActionsDropdownProps {
  employee: Employee;
  onView?: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onManageModules: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeActionsDropdown: React.FC<EmployeeActionsDropdownProps> = ({
  employee,
  onView,
  onEdit,
  onManageModules,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) => {
  const { user } = useAuth();
  const isSelf = user?.id === employee.id;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            />
          }
        >
          <MoreVertical size={16} />
          <span className="sr-only">Actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onView && (
            <DropdownMenuItem onClick={() => onView(employee)}>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>View Details</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onEdit(employee)}>
            <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Edit Employee</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onManageModules(employee)}>
            <Sliders className="mr-2 h-4 w-4 text-primary" />
            <span>Module Access</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResetPassword(employee)}>
            <KeyRound className="mr-2 h-4 w-4 text-warning" />
            <span>Reset Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleStatus(employee)}
            disabled={isSelf}
            className={isSelf ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Power
              className={`mr-2 h-4 w-4 ${
                employee.isAccessEnabled ? 'text-danger' : 'text-success'
              }`}
            />
            <span>{employee.isAccessEnabled ? 'Disable Access' : 'Enable Access'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(employee)}
            disabled={isSelf}
            className={`text-destructive focus:bg-destructive/10 focus:text-destructive ${
              isSelf ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
