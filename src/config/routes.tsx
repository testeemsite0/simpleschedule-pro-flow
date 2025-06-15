
import React from 'react';
import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import AdminPanel from '@/pages/AdminPanel';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminStripe from '@/pages/admin/AdminStripe';
import AdminWebhooks from '@/pages/admin/AdminWebhooks';
import AdminAudit from '@/pages/admin/AdminAudit';
import AdminPlans from '@/pages/admin/AdminPlans';

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
