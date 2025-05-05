
import React from 'react';
import { CalendarDays, Users, PieChart, Clock, Settings, CreditCard, Calendar, Briefcase } from 'lucide-react';
import { SidebarLink } from '@/components/layout/Sidebar';
import { Separator } from '@/components/ui/separator';

export function DashboardSidebarContent() {
  return (
    <>
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Agendamentos</h2>
        <div className="space-y-1">
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
        </div>
      </div>
      <Separator />
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Serviços</h2>
        <div className="space-y-1">
          <SidebarLink
            to="/dashboard/services"
            icon={<Briefcase className="mr-2 h-4 w-4" />}
            label="Meus Serviços"
          />
        </div>
      </div>
      <Separator />
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Relatórios</h2>
        <div className="space-y-1">
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
        </div>
      </div>
      <Separator />
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Configurações</h2>
        <div className="space-y-1">
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
        </div>
      </div>
    </>
  );
}
