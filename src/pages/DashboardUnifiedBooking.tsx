
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBookingForm } from '@/components/booking/UnifiedBookingForm';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { useAuth } from '@/context/AuthContext';
import AppointmentList from '@/components/dashboard/AppointmentList';
import AppointmentTabs from '@/components/dashboard/AppointmentTabs';
import { useAppointments } from '@/context/AppointmentContext';
import { Appointment } from '@/types';

const DashboardUnifiedBooking = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const { user } = useAuth();
  const { getAppointmentsByProfessional } = useAppointments();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);
  
  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      const data = await getAppointmentsByProfessional(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter appointments based on status and dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appointment.status === 'scheduled';
  });
  
  const pastAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today && appointment.status === 'scheduled';
  });
  
  const canceledAppointments = appointments.filter(appointment => 
    appointment.status === 'canceled'
  );
  
  const handleAppointmentCanceled = (id: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: 'canceled' as const } : app
      )
    );
  };
  
  return (
    <DashboardLayout title="Agendamentos">
      <div className="space-y-8">
        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="appointments">Ver Agendamentos</TabsTrigger>
            <TabsTrigger value="new-booking">Novo Agendamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-6 pt-4">
            <AppointmentTabs 
              upcomingAppointments={upcomingAppointments}
              pastAppointments={pastAppointments}
              canceledAppointments={canceledAppointments}
              loading={loading}
              activeTab={activeTab === "appointments" ? "upcoming" : activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              onAppointmentCanceled={handleAppointmentCanceled}
            />
          </TabsContent>
          
          <TabsContent value="new-booking" className="space-y-6 pt-4">
            {/* Ensure we only try to render when user is available */}
            {user ? (
              <UnifiedBookingProvider professionalId={user.id} isAdminView={true} key={`booking-provider-${user.id}`}>
                <UnifiedBookingForm 
                  title="Novo Agendamento" 
                  showStepIndicator={true}
                  isAdminView={true}
                  allowWalkIn={true}
                />
              </UnifiedBookingProvider>
            ) : (
              <p>Carregando informações do usuário...</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardUnifiedBooking;
