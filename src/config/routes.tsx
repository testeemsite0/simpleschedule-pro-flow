import { Home, Calendar, Users, Settings, FileText, Webhook, CreditCard, LayoutDashboard } from 'lucide-react';
import HomeView from '@/pages/Home';
import Schedules from '@/pages/Schedules';
import AdminPanel from '@/pages/admin/AdminPanel';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminStripe from '@/pages/admin/AdminStripe';
import AdminWebhooks from '@/pages/admin/AdminWebhooks';
import AdminAudit from '@/pages/admin/AdminAudit';
import Pricing from '@/pages/Pricing';
import AdminPlans from '@/pages/admin/AdminPlans';

export const routes = [
  {
    path: "/",
    element: <HomeView />,
  },
  {
    path: "/schedules",
    element: <Schedules />,
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
