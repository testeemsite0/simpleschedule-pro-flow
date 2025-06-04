
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  Clock, 
  Link as LinkIcon,
  Shield,
  Building2,
  User,
  Crown
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Visão Geral',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    children: [
      {
        title: 'Ver Agendamentos',
        href: '/dashboard/appointments',
      },
      {
        title: 'Criar Agendamento',
        href: '/dashboard/unified-booking',
      },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    children: [
      {
        title: 'Dados da Empresa',
        href: '/dashboard/company',
        icon: Building2,
      },
      {
        title: 'Preferências',
        href: '/dashboard/preferences',
        icon: User,
      },
      {
        title: 'Horários',
        href: '/dashboard/schedules',
        icon: Clock,
      },
      {
        title: 'Equipe',
        href: '/dashboard/team',
        icon: Users,
      },
      {
        title: 'Serviços',
        href: '/dashboard/services',
      },
      {
        title: 'Convênios',
        href: '/dashboard/insurance',
        icon: Shield,
      },
      {
        title: 'Link de Agendamento',
        href: '/dashboard/booking-link',
        icon: LinkIcon,
      },
    ],
  },
  {
    title: 'Meu Plano',
    href: '/dashboard/subscription',
    icon: Crown,
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
];

export const DashboardSidebarContent = () => {
  const location = useLocation();

  const renderNavItem = (item: any, depth = 0) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <div className="px-3 py-2 text-sm font-medium text-gray-600 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title}
            </div>
          </div>
          <div className="space-y-1 ml-2">
            {item.children.map((child: any) => renderNavItem(child, depth + 1))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          depth > 0 && 'ml-6'
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.title}
      </Link>
    );
  };

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <div className="space-y-2">
        {navigationItems.map((item) => renderNavItem(item))}
      </div>
    </nav>
  );
};
