
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BookingData } from './useBookingSteps';

interface UseBookingAppointmentProps {
  professionalId?: string;
  isAdminView?: boolean;
  bookingData: BookingData;
  onSuccess?: () => void;
  goToStep: (step: string) => void;
  updateErrorState: (error: string | null) => void;
}

export const useBookingAppointment = ({
  professionalId,
  isAdminView = false,
  bookingData,
  onSuccess,
  goToStep,
  updateErrorState
}: UseBookingAppointmentProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Complete booking process
  const completeBooking = async () => {
    setIsLoading(true);
    
    try {
      if (!professionalId) {
        throw new Error("ID do profissional não encontrado");
      }
      
      if (!bookingData.teamMemberId || !bookingData.date || 
          !bookingData.startTime || !bookingData.endTime ||
          !bookingData.clientName || !bookingData.clientEmail) {
        throw new Error("Dados incompletos para agendamento");
      }
      
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      
      const appointmentData = {
        professional_id: professionalId,
        team_member_id: bookingData.teamMemberId,
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail,
        client_phone: bookingData.clientPhone || '',
        date: formattedDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        notes: bookingData.notes || '',
        status: 'scheduled',
        source: isAdminView ? 'manual' : 'client',  // Changed from 'admin' to 'manual' to match expected values
        insurance_plan_id: bookingData.insuranceId === "none" ? null : bookingData.insuranceId || null,
        service_id: bookingData.serviceId || null
      };
      
      console.log("Creating appointment with data:", JSON.stringify(appointmentData));
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("Agendamento realizado com sucesso!");
        goToStep("confirmation");
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      updateErrorState(error.message || "Erro ao processar agendamento");
      toast.error(error.message || "Erro ao processar agendamento");
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
