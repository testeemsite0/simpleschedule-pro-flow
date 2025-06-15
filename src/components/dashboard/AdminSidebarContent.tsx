import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Settings, Webhook, FileText } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-secondary data-[active=true]:text-accent-foreground ${
          isActive ? 'bg-secondary text-accent-foreground' : ''
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export const AdminSidebarContent = () => {
  return (
    <div className="space-y-1">
      <NavItem 
        to="/admin-panel" 
        icon={<LayoutDashboard className="h-4 w-4" />}
        label="Dashboard"
      />
      <NavItem 
        to="/admin-panel/plans" 
        icon={<CreditCard className="h-4 w-4" />}
        label="Planos"
      />
      <NavItem 
        to="/admin-panel/users" 
        icon={<Users className="h-4 w-4" />}
        label="Usuários"
      />
      <NavItem 
        to="/admin-panel/stripe" 
        icon={<Settings className="h-4 w-4" />}
        label="Stripe"
      />
      <NavItem 
        to="/admin-panel/webhooks" 
        icon={<Webhook className="h-4 w-4" />}
        label="Webhooks"
      />
      <NavItem 
        to="/admin-panel/audit" 
        icon={<FileText className="h-4 w-4" />}
        label="Auditoria"
      />
    </div>
  );
};
