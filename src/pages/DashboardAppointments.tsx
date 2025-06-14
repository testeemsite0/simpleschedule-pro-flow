
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AppointmentTabs from '@/components/dashboard/AppointmentTabs';
import { Appointment } from '@/types';
import { useAppointmentsFetching } from '@/hooks/booking/fetching/useAppointmentsFetching';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

const DashboardAppointments = React.memo(() => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { 
    appointments, 
    isLoading, 
    error, 
    refetchAppointments 
  } = useAppointmentsFetching({
    professionalId: user?.id,
    onSuccess: () => {
      logger.info('Appointments fetched successfully');
    },
    onError: (error) => {
      logger.error('Error fetching appointments:', error);
    }
  });

  // Force refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      logger.debug('Refreshing due to refreshKey change');
      refetchAppointments();
    }
  }, [refreshKey, refetchAppointments]);

  const handleRefreshNeeded = useCallback(() => {
    logger.debug('Refresh requested');
    setRefreshKey(prev => prev + 1);
  }, []);

  // Categorize appointments with useMemo for performance
  const categorizedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const canceled: Appointment[] = [];
    
    appointments.forEach(appointment => {
      if (appointment.status === 'canceled') {
        canceled.push(appointment);
      } else {
        const appointmentDate = new Date(appointment.date);
        
        if (appointmentDate >= today) {
          upcoming.push(appointment);
        } else {
          past.push(appointment);
        }
      }
    });
    
    // Sort by date and time
    const sortByDateTime = (a: Appointment, b: Appointment) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    };
    
    upcoming.sort(sortByDateTime);
    past.sort((a, b) => sortByDateTime(b, a)); // Reverse order for past
    canceled.sort((a, b) => sortByDateTime(b, a)); // Reverse order for canceled
    
    return { upcoming, past, canceled };
  }, [appointments]);

  if (error) {
    return (
      <DashboardLayout title="Agendamentos">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar agendamentos: {error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agendamentos">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Gerencie todos os seus agendamentos em um só lugar.
        </p>
        
        <AppointmentTabs
          upcomingAppointments={categorizedAppointments.upcoming}
          pastAppointments={categorizedAppointments.past}
          canceledAppointments={categorizedAppointments.canceled}
          loading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefreshNeeded={handleRefreshNeeded}
        />
      </div>
    </DashboardLayout>
  );
});

DashboardAppointments.displayName = 'DashboardAppointments';

export default DashboardAppointments;
