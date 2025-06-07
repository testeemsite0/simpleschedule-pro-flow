
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBookingForm } from '@/components/booking/UnifiedBookingForm';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { useAuth } from '@/context/AuthContext';
import AppointmentTabs from '@/components/dashboard/AppointmentTabs';
import { useAppointments } from '@/context/AppointmentContext';
import { Appointment } from '@/types';
import { useAppointmentsRealtime } from '@/hooks/useAppointmentsRealtime';

const DashboardUnifiedBooking = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const { user } = useAuth();
  const { getAppointmentsByProfessional } = useAppointments();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getAppointmentsByProfessional(user.id);
      console.log('DashboardUnifiedBooking: Fetched appointments:', data.length);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  useAppointmentsRealtime({
    professionalId: user?.id || '',
    onAppointmentChange: () => {
      console.log('DashboardUnifiedBooking: Real-time change detected, refreshing');
      fetchAppointments();
    }
  });
  
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);
  
  // Categorize appointments properly - considering all statuses and proper date filtering
  const categorizeAppointments = (appointments: Appointment[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const canceled: Appointment[] = [];
    
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      if (appointment.status === 'canceled') {
        canceled.push(appointment);
      } else if (appointmentDate >= today && appointment.status === 'scheduled') {
        upcoming.push(appointment);
      } else if (appointmentDate < today || appointment.status === 'completed') {
        past.push(appointment);
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
    
    console.log('DashboardUnifiedBooking: Categorized appointments:', {
      upcoming: upcoming.length,
      past: past.length,
      canceled: canceled.length
    });
    
    return { upcoming, past, canceled };
  };

  const { upcoming, past, canceled } = categorizeAppointments(appointments);
  
  const handleAppointmentCanceled = (id: string) => {
    console.log('DashboardUnifiedBooking: Appointment canceled:', id);
    // Update local state immediately for better UX
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: 'canceled' as const } : app
      )
    );
  };

  const handleNewAppointmentSuccess = () => {
    console.log('DashboardUnifiedBooking: New appointment created, refreshing list');
    // Refresh appointments list when new appointment is created
    fetchAppointments();
    // Switch to appointments view to show the new appointment
    setActiveTab("appointments");
  };
  
  return (
    <DashboardLayout title="Agendamentos">
      <div className="space-y-8">
        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              📅 Ver Agendamentos
            </TabsTrigger>
            <TabsTrigger value="new-booking" className="flex items-center gap-2">
              ➕ Novo Agendamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-6 pt-4">
            <AppointmentTabs 
              upcomingAppointments={upcoming}
              pastAppointments={past}
              canceledAppointments={canceled}
              loading={loading}
              activeTab="upcoming"
              onTabChange={() => {}}
              onAppointmentCanceled={handleAppointmentCanceled}
              onRefreshNeeded={fetchAppointments}
            />
          </TabsContent>
          
          <TabsContent value="new-booking" className="space-y-6 pt-4">
            {user ? (
              <UnifiedBookingProvider professionalId={user.id} isAdminView={true} key={`booking-provider-${user.id}`}>
                <UnifiedBookingForm 
                  title="Novo Agendamento" 
                  showStepIndicator={true}
                  isAdminView={true}
                  allowWalkIn={true}
                  onSuccess={handleNewAppointmentSuccess}
                />
              </UnifiedBookingProvider>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Carregando informações do usuário...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardUnifiedBooking;
