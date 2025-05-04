
import React, { useState, useEffect } from 'react';
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
  onAppointmentCanceled?: (id: string) => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  upcomingAppointments: initialUpcoming,
  pastAppointments: initialPast,
  canceledAppointments: initialCanceled,
  loading,
  activeTab,
  onTabChange,
  onAppointmentCanceled
}) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(initialUpcoming);
  const [canceledAppointments, setCanceledAppointments] = useState<Appointment[]>(initialCanceled);
  
  useEffect(() => {
    setUpcomingAppointments(initialUpcoming);
    setCanceledAppointments(initialCanceled);
  }, [initialUpcoming, initialCanceled]);
  
  const handleAppointmentCanceled = (id: string) => {
    // Encontrar o agendamento cancelado
    const canceledApp = upcomingAppointments.find(app => app.id === id);
    if (canceledApp) {
      // Remover dos próximos
      setUpcomingAppointments(prev => prev.filter(app => app.id !== id));
      
      // Adicionar aos cancelados com status atualizado
      setCanceledAppointments(prev => [
        { ...canceledApp, status: 'canceled' },
        ...prev
      ]);
    }
    
    // Notificar o componente pai se necessário
    if (onAppointmentCanceled) {
      onAppointmentCanceled(id);
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">
          Próximos ({upcomingAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          Passados ({initialPast.length})
        </TabsTrigger>
        <TabsTrigger value="canceled">
          Cancelados ({canceledAppointments.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <AppointmentList 
            appointments={upcomingAppointments} 
            onAppointmentCanceled={handleAppointmentCanceled} 
          />
        )}
      </TabsContent>
      
      <TabsContent value="past">
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <AppointmentList appointments={initialPast} />
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
