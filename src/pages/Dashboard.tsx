
import React, { useState } from 'react';
import { format, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AppointmentList from '@/components/dashboard/AppointmentList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { getAppointmentsByProfessional } = useAppointments();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  if (!user) {
    return null;
  }
  
  const allAppointments = getAppointmentsByProfessional(user.id);
  const today = new Date();
  
  const upcomingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return isAfter(appointmentDate, today) && appointment.status === 'scheduled';
  });
  
  const pastAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return !isAfter(appointmentDate, today) || appointment.status !== 'scheduled';
  });
  
  // Get appointments for today
  const todayAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
      appointment.status === 'scheduled'
    );
  });
  
  // Get appointments for tomorrow
  const tomorrowDate = addDays(today, 1);
  const tomorrowAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      format(appointmentDate, 'yyyy-MM-dd') === format(tomorrowDate, 'yyyy-MM-dd') &&
      appointment.status === 'scheduled'
    );
  });
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-1">Agendamentos hoje</h3>
            <p className="text-3xl font-bold">{todayAppointments.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(today, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-1">Agendamentos amanhã</h3>
            <p className="text-3xl font-bold">{tomorrowAppointments.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(tomorrowDate, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-1">Total de agendamentos</h3>
            <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Próximos dias</p>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Seus agendamentos</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="past">Anteriores</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <AppointmentList appointments={upcomingAppointments} />
            </TabsContent>
            
            <TabsContent value="past">
              <AppointmentList appointments={pastAppointments} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
