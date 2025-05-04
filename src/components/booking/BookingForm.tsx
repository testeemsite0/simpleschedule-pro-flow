
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppointments } from '@/context/AppointmentContext';

interface BookingFormProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { addAppointment } = useAppointments();
  
  const formattedDate = format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: 'Erro no formulário',
        description: 'Por favor, preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the date as YYYY-MM-DD for storage
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if an appointment with the same date and start_time already exists
      const { data: existingAppointment, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professional.id)
        .eq('date', formattedDate)
        .eq('start_time', startTime)
        .eq('status', 'scheduled');
      
      if (checkError) {
        throw checkError;
      }
      
      // If an appointment already exists, show an error
      if (existingAppointment && existingAppointment.length > 0) {
        toast({
          title: 'Horário indisponível',
          description: 'Este horário já foi reservado. Por favor, selecione outro horário.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Define appointment status and source as literal types
      const appointmentStatus = 'scheduled' as const;
      const appointmentSource = 'client' as const;
      
      // Prepare appointment data
      const appointmentData = {
        professional_id: professional.id,
        client_name: name,
        client_email: email,
        client_phone: phone,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        status: appointmentStatus,
        source: appointmentSource,
      };
      
      // Create appointment and get its ID
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Ensure the returned appointment has the correct literal types for status and source
        const appointment = {
          ...data[0],
          status: appointmentStatus,
          source: appointmentSource
        };
        
        // Add the appointment to the context with proper typing
        addAppointment(appointment);
        
        toast({
          title: 'Agendamento realizado',
          description: 'Seu agendamento foi confirmado com sucesso',
        });
        
        onSuccess(name, data[0].id);
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: 'Erro ao agendar',
        description: 'Ocorreu um erro ao processar seu agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete seu agendamento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="bg-accent/30 p-3 rounded-md">
            <p className="font-medium">{professional.name}</p>
            <p className="text-sm">{formattedDate}</p>
            <p className="text-sm">{startTime} - {endTime}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas ou motivo da consulta</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Forneça detalhes adicionais se necessário"
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Voltar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Confirmar agendamento'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
