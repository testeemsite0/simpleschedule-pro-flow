
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, BarChart2, Link as LinkIcon, User, Settings, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center py-3 px-4 rounded-md transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'hover:bg-muted'
        )
      }
    >
      <Icon className="h-5 w-5 mr-3" />
      <span>{children}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold text-primary">SimpleSchedule</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <SidebarLink to="/dashboard" icon={Home}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/dashboard/schedules" icon={Clock}>
          Horários
        </SidebarLink>
        <SidebarLink to="/dashboard/appointments" icon={Calendar}>
          Agendamentos
        </SidebarLink>
        <SidebarLink to="/dashboard/reports" icon={BarChart2}>
          Relatórios
        </SidebarLink>
        <SidebarLink to="/dashboard/booking-link" icon={LinkIcon}>
          Link de Agendamento
        </SidebarLink>
        <SidebarLink to="/profile" icon={User}>
          Perfil
        </SidebarLink>
        <SidebarLink to="/settings" icon={Settings}>
          Configurações
        </SidebarLink>
      </nav>
    </div>
  );
};

export default Sidebar;
