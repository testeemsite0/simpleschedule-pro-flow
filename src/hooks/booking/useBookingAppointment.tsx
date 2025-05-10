
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BookingData } from './useBookingSteps';
import { createAppointment } from './api/dataFetcher';

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

  // Complete booking process with enhanced validation
  const completeBooking = async () => {
    setIsLoading(true);
    
    try {
      if (!professionalId) {
        throw new Error("ID do profissional não encontrado");
      }
      
      // Validate required fields
      if (!bookingData.teamMemberId) {
        throw new Error("Selecione um profissional");
      }
      
      if (!bookingData.date) {
        throw new Error("Selecione uma data");
      }
      
      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error("Selecione um horário");
      }
      
      if (!bookingData.clientName || !bookingData.clientEmail) {
        throw new Error("Informações do cliente incompletas");
      }
      
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      
      // Log complete data for debugging
      console.log("Creating appointment with validated data:", {
        professionalId,
        teamMemberId: bookingData.teamMemberId,
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        date: formattedDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        serviceId: bookingData.serviceId || null,
        insuranceId: bookingData.insuranceId === "none" ? null : bookingData.insuranceId || null
      });
      
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
        source: isAdminView ? 'manual' : 'client',
        insurance_plan_id: bookingData.insuranceId === "none" ? null : bookingData.insuranceId || null,
        service_id: bookingData.serviceId || null
      };
      
      const { data, error } = await createAppointment(appointmentData);
      
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
