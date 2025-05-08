
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, TimeSlot } from '@/types';
import { useAppointments } from '@/context/AppointmentContext';
import AppointmentCreationForm from '@/components/dashboard/AppointmentCreationForm';
import AppointmentTabs from '@/components/dashboard/AppointmentTabs';

const DashboardAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getTimeSlotsByProfessional, isWithinFreeLimit, addAppointment } = useAppointments();
  
  // Estados para buscar dados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para criação de agendamento
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado da guia
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchTimeSlots();
    }
  }, [user]);
  
  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setAppointments(data as Appointment[]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTimeSlots = async () => {
    if (!user) return;
    
    try {
      const slots = await getTimeSlotsByProfessional(user.id);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };
  
  const handleFormSubmit = async (formData: {
    selectedDate: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
    teamMemberId?: string;
    insurancePlanId?: string;
    serviceId?: string; // Adicionado campo de serviço
  }) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar agendamentos',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verifica se está dentro do limite gratuito
      const withinLimit = await isWithinFreeLimit(user.id);
      
      if (!withinLimit) {
        toast({
          title: 'Limite Atingido',
          description: 'Você atingiu o limite de agendamentos do plano gratuito. Atualize para o plano Premium para continuar.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Verifica se este horário já está reservado
      const existingBooking = appointments.find(app => 
        app.date === formData.selectedDate && 
        app.start_time === formData.startTime && 
        app.status === 'scheduled'
      );
      
      if (existingBooking) {
        toast({
          title: 'Erro',
          description: 'Este horário já está reservado.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Define status e fonte do agendamento como tipos literais
      const appointmentStatus = 'scheduled' as const;
      const appointmentSource = 'manual' as const;
      
      // Prepara dados do agendamento
      const appointmentData = {
        professional_id: user.id,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone,
        date: formData.selectedDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        notes: formData.notes,
        status: appointmentStatus,
        source: appointmentSource,
        team_member_id: formData.teamMemberId || null,
        insurance_plan_id: formData.insurancePlanId || null,
        service_id: formData.serviceId || null // Adiciona service_id
      };
      
      // Cria agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Garante que o agendamento retornado tenha os tipos literais corretos
        const appointment = {
          ...data[0],
          status: appointmentStatus,
          source: appointmentSource
        };
        
        // Adiciona o agendamento ao contexto com a tipagem adequada
        addAppointment(appointment);
        
        // Também atualiza o estado local para garantir atualização imediata da UI
        setAppointments(prevAppointments => [...prevAppointments, appointment]);
        
        toast({
          title: 'Sucesso',
          description: 'Agendamento criado com sucesso',
        });
        
        // Redefine formulário e fecha diálogo
        setIsDialogOpen(false);
      }
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAppointmentCanceled = (id: string) => {
    // Atualiza o estado local dos agendamentos para refletir o cancelamento
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: 'canceled' } : app
      )
    );
  };
  
  if (!user) {
    return null;
  }
  
  // Filtra agendamentos com base na guia
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
  
  return (
    <DashboardLayout title="Gerenciar Agendamentos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie todos os agendamentos dos seus clientes.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                Criar Agendamento Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-lg sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  Criar Novo Agendamento
                </DialogTitle>
              </DialogHeader>
              
              <AppointmentCreationForm 
                professionalId={user.id}
                timeSlots={timeSlots}
                appointments={appointments}
                isSubmitting={isSubmitting}
                onCancel={() => setIsDialogOpen(false)}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Agendamentos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os seus compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentTabs 
              upcomingAppointments={upcomingAppointments}
              pastAppointments={pastAppointments}
              canceledAppointments={canceledAppointments}
              loading={loading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAppointmentCanceled={handleAppointmentCanceled}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAppointments;
