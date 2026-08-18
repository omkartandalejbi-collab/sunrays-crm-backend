import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { ModuleGuard } from './ModuleGuard';
import { Landing } from '../pages/Landing/Landing';
import { Login } from '../pages/Login/Login';
import { useAuth } from '../hooks/useAuth';

// Employee Pages
import { DashboardOverview } from '../pages/Employee/DashboardOverview';
import { AssignedClients } from '../pages/Employee/AssignedClients';
import { FollowUps } from '../pages/Employee/FollowUps';
import { CallHistory } from '../pages/Employee/CallHistory';
import { Profile } from '../pages/Employee/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/Admin/AdminDashboard';
import { AdminClients } from '../pages/Admin/AdminClients';
import { AdminEmployees } from '../pages/Admin/AdminEmployees';
import { AdminEmployeeDetail } from '../pages/Admin/AdminEmployeeDetail';

// Placeholder Dashboard content for Phase 1
const DashboardPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center shadow-sm">
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <p className="mt-2 text-muted-foreground">
      This module will be implemented in the next phase.
    </p>
  </div>
);


const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (user?.role === 'employee') {
    return (
      <ModuleGuard moduleId="dashboard">
        <DashboardOverview />
      </ModuleGuard>
    );
  }

  return <Navigate to="/login" replace />;
};

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center p-12">Loading...</div>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/dashboard/admin/clients"
          element={
            <AdminRouteGuard>
              <AdminClients />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/dashboard/admin/employees"
          element={
            <AdminRouteGuard>
              <AdminEmployees />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/dashboard/admin/employees/:id"
          element={
            <AdminRouteGuard>
              <AdminEmployeeDetail />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/dashboard/admin/*"
          element={
            <AdminRouteGuard>
              <DashboardPlaceholder title="Admin Module" />
            </AdminRouteGuard>
          }
        />

        {/* Employee Routes */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route
          path="/dashboard/assigned"
          element={
            <ModuleGuard moduleId="assignedClients">
              <AssignedClients />
            </ModuleGuard>
          }
        />
        <Route
          path="/dashboard/follow-ups"
          element={
            <ModuleGuard moduleId="followUps">
              <FollowUps />
            </ModuleGuard>
          }
        />
        <Route
          path="/dashboard/call-history"
          element={
            <ModuleGuard moduleId="callHistory">
              <CallHistory />
            </ModuleGuard>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ModuleGuard moduleId="profile">
              <Profile />
            </ModuleGuard>
          }
        />

        {/* Catch-all for dashboard */}
        <Route path="/dashboard/*" element={<DashboardPlaceholder title="Module Placeholder" />} />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <p className="mt-4 text-xl">Page not found</p>
            <a href="/" className="mt-6 text-primary hover:underline">
              Go back home
            </a>
          </div>
        }
      />
    </Routes>
  );
};
