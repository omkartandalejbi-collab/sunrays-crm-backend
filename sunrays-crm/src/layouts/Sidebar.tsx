import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCircle,
  ChevronLeft,
  Sun,
  LogOut,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { AppModuleId } from '../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  moduleId?: AppModuleId;
}

interface NavGroup {
  label: string;
  links: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { user, logout, hasModuleAccess } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const adminGroups: NavGroup[] = [
    {
      label: 'MAIN',
      links: [{ name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard }],
    },
    {
      label: 'MANAGEMENT',
      links: [
        { name: 'All Clients', path: '/dashboard/admin/clients', icon: Users },
        { name: 'Employees', path: '/dashboard/admin/employees', icon: Users },
      ],
    },
    {
      label: 'SYSTEM',
      links: [{ name: 'Reports', path: '/dashboard/admin/reports', icon: FileText }],
    },
  ];

  const employeeGroups: NavGroup[] = [
    {
      label: 'MAIN',
      links: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          moduleId: 'dashboard',
        },
      ],
    },
    {
      label: 'SALES & LEADS',
      links: [
        {
          name: 'Assigned Clients',
          path: '/dashboard/assigned',
          icon: Users,
          badge: user?.assignedLeads || 24,
          moduleId: 'assignedClients',
        },
        {
          name: 'Follow Ups',
          path: '/dashboard/follow-ups',
          icon: Clock,
          moduleId: 'followUps',
        },
        {
          name: 'Call History',
          path: '/dashboard/call-history',
          icon: PhoneCall,
          moduleId: 'callHistory',
        },
      ],
    },
    {
      label: 'ACCOUNT',
      links: [
        {
          name: 'Profile',
          path: '/dashboard/profile',
          icon: UserCircle,
          moduleId: 'profile',
        },
      ],
    },
  ];

  const rawGroups = user?.role === 'admin' ? adminGroups : employeeGroups;

  // Filter groups and links based on allowed module permissions for employee
  const visibleGroups = rawGroups
    .map((group) => {
      if (user?.role === 'admin') return group;
      const filteredLinks = group.links.filter((link) =>
        link.moduleId ? hasModuleAccess(link.moduleId) : true
      );
      return {
        ...group,
        links: filteredLinks,
      };
    })
    .filter((group) => group.links.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col border-r bg-sidebar border-sidebar-border z-20 shrink-0 text-sidebar-foreground"
    >
      <div className="flex h-[72px] shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 overflow-hidden w-full px-2">
          <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground shadow-sm shrink-0">
            <Sun size={24} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="truncate text-[22px] font-bold tracking-tight text-white whitespace-nowrap"
              >
                Sunrays
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent hover:text-white transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft size={14} />
        </motion.div>
      </button>

      <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        {visibleGroups.map((group, i) => (
          <div key={group.label} className={cn('mb-6', i > 0 && 'mt-6')}>
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 mb-3 flex items-center"
              >
                <span className="text-small-label text-sidebar-foreground/60">{group.label}</span>
              </motion.div>
            ) : (
              <div className="px-4 mb-3 flex justify-center">
                <div className="w-8 h-px bg-sidebar-border" />
              </div>
            )}

            <div className="space-y-1 px-4">
              {group.links.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.path === '/dashboard'}
                    title={collapsed ? link.name : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                        collapsed && 'justify-center px-0'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="active-sidebar-indicator"
                            className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-white rounded-r-full"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={20}
                          className={cn(
                            'shrink-0',
                            isActive
                              ? 'text-white'
                              : 'text-sidebar-foreground/80 group-hover:text-white'
                          )}
                        />
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="truncate flex-1"
                          >
                            {link.name}
                          </motion.span>
                        )}
                        {!collapsed && link.badge !== undefined && (
                          <Badge
                            className={cn(
                              'ml-auto flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] h-5 min-w-5',
                              isActive ? 'bg-white/20 text-white' : 'bg-sidebar-accent text-white'
                            )}
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section at Bottom */}
      <div className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent transition-colors"
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 border border-sidebar-border">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar',
                  user?.status === 'Active'
                    ? 'bg-success'
                    : user?.status === 'On Leave'
                    ? 'bg-warning'
                    : 'bg-muted-foreground'
                )}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-sidebar-foreground hover:text-white rounded-lg hover:bg-sidebar transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              title={user?.name}
            >
              <Avatar className="h-10 w-10 border border-sidebar-border">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar',
                  user?.status === 'Active'
                    ? 'bg-success'
                    : user?.status === 'On Leave'
                    ? 'bg-warning'
                    : 'bg-muted-foreground'
                )}
              />
            </div>
            <button
              onClick={logout}
              className="p-2 text-sidebar-foreground hover:text-white rounded-lg hover:bg-sidebar-accent transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
