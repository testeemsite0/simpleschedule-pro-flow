
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment } from '@/types';
import AppointmentList from './AppointmentList';

interface AppointmentTabsProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  canceledAppointments: Appointment[];
  loading: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  upcomingAppointments,
  pastAppointments,
  canceledAppointments,
  loading,
  activeTab,
  onTabChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">
          Próximos ({upcomingAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          Passados ({pastAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="canceled">
          Cancelados ({canceledAppointments.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <AppointmentList appointments={upcomingAppointments} />
        )}
      </TabsContent>
      
      <TabsContent value="past">
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <AppointmentList appointments={pastAppointments} />
        )}
      </TabsContent>
      
      <TabsContent value="canceled">
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <AppointmentList appointments={canceledAppointments} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentTabs;
