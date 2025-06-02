
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment } from '@/types';
import AppointmentList from './AppointmentList';
import { useAppointmentsRealtime } from '@/hooks/useAppointmentsRealtime';
import { useAuth } from '@/context/AuthContext';

interface AppointmentTabsProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  canceledAppointments: Appointment[];
  loading: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  onAppointmentCanceled?: (id: string) => void;
  onRefreshNeeded?: () => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  upcomingAppointments: initialUpcoming,
  pastAppointments: initialPast,
  canceledAppointments: initialCanceled,
  loading,
  activeTab,
  onTabChange,
  onAppointmentCanceled,
  onRefreshNeeded
}) => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(initialUpcoming);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>(initialPast);
  const [canceledAppointments, setCanceledAppointments] = useState<Appointment[]>(initialCanceled);
  
  // Set up real-time updates
  useAppointmentsRealtime({
    professionalId: user?.id || '',
    onAppointmentChange: () => {
      console.log('Real-time change detected, refreshing appointments');
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
    }
  });
  
  useEffect(() => {
    setUpcomingAppointments(initialUpcoming);
    setPastAppointments(initialPast);
    setCanceledAppointments(initialCanceled);
  }, [initialUpcoming, initialPast, initialCanceled]);
  
  const handleAppointmentCanceled = (id: string) => {
    // Find the canceled appointment
    const canceledApp = upcomingAppointments.find(app => app.id === id);
    if (canceledApp) {
      // Remove from upcoming
      const updatedUpcoming = upcomingAppointments.filter(app => app.id !== id);
      setUpcomingAppointments(updatedUpcoming);
      
      // Add to canceled with updated status
      const updatedCanceled: Appointment[] = [
        { ...canceledApp, status: 'canceled' as const },
        ...canceledAppointments
      ];
      setCanceledAppointments(updatedCanceled);
    }
    
    // Notify parent component
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
