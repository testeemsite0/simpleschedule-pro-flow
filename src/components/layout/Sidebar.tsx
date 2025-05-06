
// Since we can't modify this file, we'll create a custom sidebar content component
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Users, PieChart, Clock, Settings, CreditCard, Calendar, Briefcase, Shield } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

export function Sidebar({ className, isOpen, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "border-r bg-secondary/10 flex h-full flex-col py-3 md:w-72",
        isOpen ? "block" : "hidden md:flex",
        className
      )}
      {...props}
    >
      <ScrollArea className="flex-1 space-y-0.5">
        <nav className="flex flex-col space-y-1">
          <SidebarLink
            to="/dashboard"
            icon={<CalendarDays className="mr-2 h-4 w-4" />}
            label="Dashboard"
          />
          <SidebarLink
            to="/dashboard/appointments"
            icon={<Calendar className="mr-2 h-4 w-4" />}
            label="Agendamentos"
          />
          <SidebarLink
            to="/dashboard/schedules"
            icon={<Clock className="mr-2 h-4 w-4" />}
            label="Horários"
          />
          <Separator />
          <SidebarLink
            to="/dashboard/reports"
            icon={<PieChart className="mr-2 h-4 w-4" />}
            label="Relatórios"
          />
          <SidebarLink
            to="/dashboard/clients"
            icon={<Users className="mr-2 h-4 w-4" />}
            label="Clientes"
          />
          <SidebarLink
            to="/dashboard/insurance"
            icon={<Shield className="mr-2 h-4 w-4" />}
            label="Convênios"
          />
          <Separator />
          <SidebarLink
            to="/dashboard/booking-link"
            icon={<CreditCard className="mr-2 h-4 w-4" />}
            label="Link de Agendamento"
          />
          <SidebarLink
            to="/dashboard/settings"
            icon={<Settings className="mr-2 h-4 w-4" />}
            label="Preferências"
          />
        </nav>
      </ScrollArea>
    </aside>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary/5",
          isActive ? "bg-secondary/5 text-primary" : "text-muted-foreground"
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
