
import React from 'react';
import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import DashboardAppointments from '@/pages/DashboardAppointments';
import DashboardSubscription from '@/pages/DashboardSubscription';
import DashboardServices from '@/pages/DashboardServices';
import DashboardTeam from '@/pages/DashboardTeam';
import DashboardSchedules from '@/pages/DashboardSchedules';
import DashboardClients from '@/pages/DashboardClients';
import DashboardReports from '@/pages/DashboardReports';
import DashboardPreferences from '@/pages/DashboardPreferences';
import AdminPanel from '@/pages/AdminPanel';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminStripe from '@/pages/admin/AdminStripe';
import AdminWebhooks from '@/pages/admin/AdminWebhooks';
import AdminAudit from '@/pages/admin/AdminAudit';
import AdminPlans from '@/pages/admin/AdminPlans';
import PublicBooking from '@/pages/PublicBooking';

export const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dashboard/appointments",
    element: <DashboardAppointments />,
  },
  {
    path: "/dashboard/subscription",
    element: <DashboardSubscription />,
  },
  {
    path: "/dashboard/services",
    element: <DashboardServices />,
  },
  {
    path: "/dashboard/team",
    element: <DashboardTeam />,
  },
  {
    path: "/dashboard/schedules",
    element: <DashboardSchedules />,
  },
  {
    path: "/dashboard/clients",
    element: <DashboardClients />,
  },
  {
    path: "/dashboard/reports",
    element: <DashboardReports />,
  },
  {
    path: "/dashboard/preferences",
    element: <DashboardPreferences />,
  },
  {
    path: "/booking/:slug",
    element: <PublicBooking />,
  },
  {
    path: "/admin-panel",
    element: <AdminPanel />,
  },
  {
    path: "/admin-panel/users",
    element: <AdminUsers />,
  },
  {
    path: "/admin-panel/stripe",
    element: <AdminStripe />,
  },
  {
    path: "/admin-panel/webhooks",
    element: <AdminWebhooks />,
  },
  {
    path: "/admin-panel/audit",
    element: <AdminAudit />,
  },
  {
    path: "/admin-panel/plans",
    element: <AdminPlans />,
  },
];

// Export for App.tsx compatibility
export const routeConfigs = routes.map(route => ({
  path: route.path,
  component: () => route.element,
  loadingMessage: "Carregando..."
}));
