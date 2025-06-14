
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { useBookingValidation } from './useBookingValidation';
import { BookingData } from './useBookingSteps';

interface UseBookingAppointmentProps {
  professionalId?: string;
  isAdminView?: boolean;
  bookingData: BookingData;
  onSuccess?: () => void;
  goToStep: (step: string) => void;
  updateErrorState: (error: string | null) => void;
  resetBooking: () => void;
}

export const useBookingAppointment = ({
  professionalId,
  isAdminView = false,
  bookingData,
  onSuccess,
  goToStep,
  updateErrorState,
  resetBooking
}: UseBookingAppointmentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendAppointmentConfirmation } = useNotifications();
  const { validateBookingData } = useBookingValidation();

  const completeBooking = async (): Promise<boolean> => {
    if (!professionalId) {
      updateErrorState('ID do profissional não encontrado');
      return false;
    }

    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime || 
        !bookingData.clientName || !bookingData.clientEmail) {
      updateErrorState('Dados incompletos para criar o agendamento');
      return false;
    }

    setIsLoading(true);
    updateErrorState(null);

    try {
      console.log('Creating appointment with data:', bookingData);

      // Validate booking data including conflicts
      const isValid = await validateBookingData(
        professionalId,
        bookingData.teamMemberId,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime,
        bookingData.clientName,
        bookingData.clientEmail
      );

      if (!isValid) {
        setIsLoading(false);
        return false;
      }

      // Get service details for price
      let servicePrice = 0;
      if (bookingData.serviceId) {
        const { data: service } = await supabase
          .from('services')
          .select('price')
          .eq('id', bookingData.serviceId)
          .single();
        
        if (service) {
          servicePrice = service.price;
        }
      }

      // Create appointment
      const appointmentData = {
        professional_id: professionalId,
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail,
        client_phone: bookingData.clientPhone || null,
        date: bookingData.date.toISOString().split('T')[0],
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        notes: bookingData.notes || null,
        status: 'scheduled',
        source: isAdminView ? 'manual' : 'client',
        service_id: bookingData.serviceId || null,
        team_member_id: bookingData.teamMemberId || null,
        insurance_plan_id: bookingData.insuranceId === 'none' ? null : bookingData.insuranceId,
        price: servicePrice || null,
        free_tier_used: true
      };

      console.log('Inserting appointment:', appointmentData);

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        updateErrorState(`Erro ao criar agendamento: ${error.message}`);
        return false;
      }

      console.log('Appointment created successfully:', appointment);

      // Get professional name for notification
      const { data: professional } = await supabase
        .from('profiles')
        .select('name, display_name')
        .eq('id', professionalId)
        .single();

      const professionalName = professional?.display_name || professional?.name || 'Profissional';

      // Send confirmation email (don't wait for it)
      sendAppointmentConfirmation(appointment, professionalName);

      toast.success('Agendamento criado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to confirmation step
      goToStep('confirmation');
      
      return true;
    } catch (error: any) {
      console.error('Error in completeBooking:', error);
      updateErrorState(error.message || 'Erro ao criar agendamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    completeBooking
  };
};
