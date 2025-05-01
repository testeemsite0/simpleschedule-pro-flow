
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, TimeSlot } from '@/types';
import AppointmentList from '@/components/dashboard/AppointmentList';
import { useAppointments } from '@/context/AppointmentContext';

const DashboardAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getTimeSlotsByProfessional, isWithinFreeLimit } = useAppointments();
  
  // States for fetching data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for appointment creation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string, label: string }[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab state
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
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Get all time slots for this day
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.available
    );
    
    // Convert these into appointment slots
    const slots: { value: string, label: string }[] = [];
    
    daySlotsData.forEach(slot => {
      // Convert times to minutes for easier calculation
      const startMinutes = timeStringToMinutes(slot.start_time);
      const endMinutes = timeStringToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Handle lunch break if present
      const lunchStartMinutes = slot.lunch_break_start ? timeStringToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeStringToMinutes(slot.lunch_break_end) : null;
      
      // Generate slots
      for (let timeMinutes = startMinutes; timeMinutes + duration <= endMinutes; timeMinutes += duration) {
        // Skip slots that overlap with lunch break
        if (
          lunchStartMinutes !== null && 
          lunchEndMinutes !== null && 
          ((timeMinutes < lunchEndMinutes && timeMinutes + duration > lunchStartMinutes) || 
           (timeMinutes >= lunchStartMinutes && timeMinutes < lunchEndMinutes))
        ) {
          continue;
        }
        
        const startTime = minutesToTimeString(timeMinutes);
        const endTime = minutesToTimeString(timeMinutes + duration);
        
        // Check if this slot is already booked
        const isBooked = appointments.some(app => 
          app.date === selectedDate && 
          app.start_time === startTime && 
          app.status === 'scheduled'
        );
        
        if (!isBooked) {
          const value = `${startTime}-${endTime}`;
          const label = `${startTime} - ${endTime}`;
          slots.push({ value, label });
        }
      }
    });
    
    // Sort by time
    slots.sort((a, b) => {
      const aStart = a.value.split('-')[0];
      const bStart = b.value.split('-')[0];
      return timeStringToMinutes(aStart) - timeStringToMinutes(bStart);
    });
    
    setAvailableTimeSlots(slots);
  }, [selectedDate, timeSlots, appointments]);
  
  const timeStringToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const minutesToTimeString = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar agendamentos',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if within free limit
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
      
      // Parse time slot
      const [startTime, endTime] = selectedTimeSlot.split('-');
      
      // Create appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          professional_id: user.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          notes,
          status: 'scheduled',
          source: 'manual' // Mark as manually created
        }])
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso',
      });
      
      // Reset form
      setSelectedDate('');
      setSelectedTimeSlot('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setNotes('');
      setIsDialogOpen(false);
      
      // Refresh appointments
      fetchAppointments();
      
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
  
  if (!user) {
    return null;
  }
  
  // Filter appointments based on tab
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Criar Novo Agendamento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Horário</Label>
                    <Select
                      value={selectedTimeSlot}
                      onValueChange={setSelectedTimeSlot}
                      disabled={availableTimeSlots.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableTimeSlots.length === 0 && selectedDate && (
                      <p className="text-sm text-amber-600 mt-2">
                        Não há horários disponíveis para esta data.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome do Cliente</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email do Cliente</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone do Cliente</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || availableTimeSlots.length === 0}>
                    {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
                  </Button>
                </div>
              </form>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAppointments;
