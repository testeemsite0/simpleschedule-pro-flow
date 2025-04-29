
import React, { useState, useEffect } from 'react';
import { format, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AppointmentList from '@/components/dashboard/AppointmentList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { Appointment } from '@/types';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { getAppointmentsByProfessional, countMonthlyAppointments, isWithinFreeLimit } = useAppointments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const data = await getAppointmentsByProfessional(user.id);
          setAppointments(data);
          
          // Check appointment count for limit warning
          const count = await countMonthlyAppointments(user.id);
          setMonthlyCount(count);
          setIsOverLimit(count >= 5);
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar seus agendamentos",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchAppointments();
  }, [user, getAppointmentsByProfessional, countMonthlyAppointments, toast]);
  
  if (!user) {
    return null;
  }
  
  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Carregando agendamentos...</p>
      </DashboardLayout>
    );
  }
  
  const today = new Date();
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return isAfter(appointmentDate, today) && appointment.status === 'scheduled';
  });
  
  const canceledAppointments = appointments.filter(appointment => 
    appointment.status === 'canceled'
  );
  
  const completedAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return !isAfter(appointmentDate, today) && appointment.status === 'scheduled';
  });
  
  // Get appointments for today
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
      appointment.status === 'scheduled'
    );
  });
  
  // Get appointments for tomorrow
  const tomorrowDate = addDays(today, 1);
  const tomorrowAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      format(appointmentDate, 'yyyy-MM-dd') === format(tomorrowDate, 'yyyy-MM-dd') &&
      appointment.status === 'scheduled'
    );
  });
  
  const totalCanceledThisMonth = canceledAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return isAfter(appointmentDate, firstDayOfMonth);
  }).length;
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {isOverLimit && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite de agendamentos atingido</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>Você atingiu o limite de agendamentos do plano gratuito. Atualize para o plano Premium para continuar recebendo novos agendamentos.</div>
              <Button asChild className="mt-2 sm:mt-0 whitespace-nowrap">
                <Link to="/pricing">Atualizar Plano</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <h3 className="text-lg font-medium mb-1">Agendamentos confirmados</h3>
            <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Próximos dias</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-1">Cancelados este mês</h3>
            <p className="text-3xl font-bold">{totalCanceledThisMonth}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(today, "MMMM", { locale: ptBR })}
            </p>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Seus agendamentos</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Confirmados</TabsTrigger>
              <TabsTrigger value="canceled">Cancelados</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <AppointmentList appointments={upcomingAppointments} />
            </TabsContent>
            
            <TabsContent value="canceled">
              <AppointmentList appointments={canceledAppointments} />
            </TabsContent>

            <TabsContent value="completed">
              <AppointmentList appointments={completedAppointments} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
