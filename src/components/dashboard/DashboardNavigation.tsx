
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  LayoutDashboard, 
  FileText, 
  UserRound, 
  Link2, 
  BarChart2, 
  Shield 
} from 'lucide-react';

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { title: 'Agendamentos', icon: <Calendar size={20} />, path: '/dashboard/appointments' },
  { title: 'Horários', icon: <Clock size={20} />, path: '/dashboard/schedules' },
  { title: 'Equipe', icon: <Users size={20} />, path: '/dashboard/team' },
  { title: 'Serviços', icon: <FileText size={20} />, path: '/dashboard/services' },
  { title: 'Convênios', icon: <Shield size={20} />, path: '/dashboard/insurance' },
  { title: 'Clientes', icon: <UserRound size={20} />, path: '/dashboard/clients' },
  { title: 'Link de Agendamento', icon: <Link2 size={20} />, path: '/dashboard/booking-link' },
  { title: 'Relatórios', icon: <BarChart2 size={20} />, path: '/dashboard/reports' },
  { title: 'Preferências', icon: <Settings size={20} />, path: '/dashboard/preferences' },
];

interface DashboardNavigationProps {
  className?: string;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ className }) => {
  const location = useLocation();
  
  return (
    <nav className={`space-y-1 ${className}`}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-primary/10'
          }`}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
};
