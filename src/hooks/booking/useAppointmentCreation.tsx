
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppointments } from '@/context/AppointmentContext';
import { Service } from '@/types';

interface UseAppointmentCreationProps {
  professionalId: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
  serviceId?: string;
  insurancePlanId?: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  services: Service[];
  validateClientInfo: () => boolean;
  onSuccess: (name: string, appointmentId: string) => void;
}

export const useAppointmentCreation = ({
  professionalId,
  selectedDate,
  startTime,
  endTime,
  teamMemberId,
  serviceId,
  insurancePlanId,
  name,
  email,
  phone,
  notes,
  services,
  validateClientInfo,
  onSuccess
}: UseAppointmentCreationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addAppointment } = useAppointments();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateClientInfo()) return;
    
    setIsLoading(true);
    
    try {
      // Format the date as YYYY-MM-DD for storage
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if an appointment with the same date and start_time already exists
      const { data: existingAppointment, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
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
      
      // Get price from selected service if available
      let price = null;
      if (serviceId) {
        const selectedService = services.find(s => s.id === serviceId);
        if (selectedService) {
          price = selectedService.price;
        }
      }
      
      // Define appointment status and source as literal types
      const appointmentStatus = 'scheduled' as const;
      const appointmentSource = 'client' as const;
      
      // Prepare appointment data
      const appointmentData = {
        professional_id: professionalId,
        client_name: name,
        client_email: email,
        client_phone: phone,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        status: appointmentStatus,
        source: appointmentSource,
        team_member_id: teamMemberId || null,
        insurance_plan_id: insurancePlanId === "none" ? null : insurancePlanId || null,
        service_id: serviceId || null,
        price: price,
      };
      
      // Create appointment and get its ID
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Ensure the appointment has the correct literal types
        const newAppointment = {
          ...data[0],
          status: appointmentStatus,
          source: appointmentSource
        };
        
        // Add the appointment to the context
        addAppointment(newAppointment);
        
        toast({
          title: 'Agendamento realizado',
          description: 'Seu agendamento foi confirmado com sucesso',
        });
        
        onSuccess(name, data[0].id);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: 'Erro ao agendar',
        description: 'Ocorreu um erro ao processar seu agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
