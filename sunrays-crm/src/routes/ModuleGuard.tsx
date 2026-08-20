import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppModuleId } from '../types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';

interface ModuleGuardProps {
  moduleId: AppModuleId;
  children: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ moduleId, children }) => {
  const { user, hasModuleAccess, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="text-muted-foreground text-sm">Checking permissions...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to all modules
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // Check if module is allowed for employee
  if (!hasModuleAccess(moduleId)) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm max-w-lg mx-auto my-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Module Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your administrator has not enabled access to this module for your account.
          Please contact your administrator to request permissions.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.assign('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
