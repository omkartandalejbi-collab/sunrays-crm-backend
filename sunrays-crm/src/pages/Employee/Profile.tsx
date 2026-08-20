import React, { useState } from 'react';
import { ProfileCard } from '../../components/common/ProfileCard';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Shield, Bell, Eye, MonitorSmartphone, Key } from 'lucide-react';
import { Employee } from '../../types';
import { ChangePasswordModal } from '../../components/employee/ChangePasswordModal';
import { EditProfileModal } from '../../components/employee/EditProfileModal';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  const currentEmployee: Employee = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '+91 98765 43210',
    department: user.department || 'Sales',
    designation: user.designation || (user.role === 'admin' ? 'Administrator' : 'Sales Executive'),
    role: user.role,
    status: user.status || 'Active',
    isAccessEnabled: user.isAccessEnabled ?? true,
    allowedModules: user.allowedModules || ['dashboard', 'assignedClients', 'profile'],
    performanceScore: user.performanceScore || 92,
    assignedLeads: user.assignedLeads || 142,
    calls: user.calls || 250,
    meetings: user.meetings || 15,
    interested: user.interested || 45,
    converted: user.converted || 30,
    conversionRate: user.conversionRate || 21.12,
    avatarSeed: user.avatarSeed || user.name,
    avatarUrl: user.avatarUrl,
    joiningDate: user.createdAt || '2023-01-15T00:00:00Z',
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1200px] mx-auto w-full">
      <div>
        <h1 className="text-dashboard-title">My Profile</h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage your account settings, preferences and security.
        </p>
      </div>

      <ProfileCard
        user={user}
        employee={currentEmployee}
        onEdit={() => setIsEditOpen(true)}
        onChangePassword={() => setIsPasswordOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="md:col-span-1">
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-muted-foreground" /> Security
          </h3>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
            Manage your account's security and authentication methods.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="enterprise-card !p-0 overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[14px] text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="h-px bg-border w-full" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-[14px] text-foreground">Active Sessions</p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Manage your active sessions across devices.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="font-medium h-9 border-border bg-card text-foreground hover:bg-muted shadow-sm"
                >
                  <MonitorSmartphone className="mr-2 h-4 w-4 text-muted-foreground" /> Manage
                  Devices
                </Button>
              </div>
            </div>
            <div className="bg-muted/30 px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-[12px] font-medium text-muted-foreground">
                Password managed securely with bcrypt encryption
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordOpen(true)}
                className="h-8 text-[12px] font-medium border-border shadow-sm"
              >
                <Key className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border w-full my-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-foreground">
            <Bell className="h-4 w-4 text-muted-foreground" /> Notifications
          </h3>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
            Choose what we get in touch about and how we communicate with you.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="enterprise-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-foreground">New Lead Assignments</p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Get notified when a new lead is assigned to you.
                </p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="h-px bg-border w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-foreground">Follow Up Reminders</p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Receive alerts 15 minutes before scheduled follow ups.
                </p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="h-px bg-border w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-foreground">
                  Daily Performance Summary
                </p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  An email summary of your daily call metrics and conversions.
                </p>
              </div>
              <Switch checked={false} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border w-full my-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-foreground">
            <Eye className="h-4 w-4 text-muted-foreground" /> Preferences
          </h3>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
            Customize how the CRM looks and behaves for you.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="enterprise-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-foreground">Compact Mode</p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Reduce spacing in tables and lists to see more data.
                </p>
              </div>
              <Switch checked={false} />
            </div>
            <div className="h-px bg-border w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-foreground">Default View</p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Choose which page loads when you log in.
                </p>
              </div>
              <select className="h-10 w-36 rounded-md border border-border bg-card px-3 py-1 text-[13px] font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="dashboard">Dashboard</option>
                <option value="leads">My Leads</option>
                <option value="followups">Follow Ups</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Self-Service Modals */}
      <EditProfileModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
        onSuccess={() => refreshUser()}
      />

      <ChangePasswordModal
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        onSuccess={() => refreshUser()}
      />
    </div>
  );
};
