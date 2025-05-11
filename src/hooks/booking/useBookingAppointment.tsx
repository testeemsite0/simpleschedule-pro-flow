
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BookingData } from './useBookingSteps';
import { createAppointment } from './api/dataFetcher';
import { useAppointments } from '@/context/AppointmentContext';

interface UseBookingAppointmentProps {
  professionalId?: string;
  isAdminView?: boolean;
  bookingData: BookingData;
  onSuccess?: () => void;
  goToStep: (step: string) => void;
  updateErrorState: (error: string | null) => void;
  resetBooking?: () => void;
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
  const { isWithinFreeLimit, checkInsurancePlanLimit } = useAppointments();

  // Complete booking process with enhanced validation
  const completeBooking = async () => {
    setIsLoading(true);
    
    try {
      // Log the current booking data for debugging
      console.log("Starting booking process with data:", JSON.stringify(bookingData, null, 2));
      
      if (!professionalId) {
        throw new Error("ID do profissional não encontrado");
      }
      
      // Enhanced validation with detailed error messages
      if (!bookingData.teamMemberId) {
        throw new Error("Selecione um profissional");
      }
      
      if (!bookingData.date) {
        throw new Error("Selecione uma data");
      }
      
      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error("Selecione um horário");
      }
      
      if (!bookingData.clientName) {
        throw new Error("Nome do cliente é obrigatório");
      }
      
      if (!bookingData.clientEmail) {
        throw new Error("Email do cliente é obrigatório");
      }
      
      // Extra validation for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.clientEmail)) {
        throw new Error("Email do cliente em formato inválido");
      }
      
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      
      // Check appointment limits for free tier and insurance plans
      if (!isAdminView) {
        // Only check limits for client-initiated bookings
        console.log("Checking free tier limits for professional:", professionalId);
        
        const withinFreeLimit = await isWithinFreeLimit(professionalId);
        console.log("Free limit check result:", withinFreeLimit);
        
        if (!withinFreeLimit) {
          // This is a critical error - very important to show to users
          const limitErrorMessage = "Limite de agendamentos gratuitos atingido. Entre em contato com o profissional diretamente ou assine o plano premium.";
          toast.error(limitErrorMessage);
          throw new Error(limitErrorMessage);
        }
        
        // Check insurance plan limits if using one
        if (bookingData.insuranceId && bookingData.insuranceId !== "none") {
          console.log("Checking insurance plan limits for:", bookingData.insuranceId);
          const withinInsuranceLimit = await checkInsurancePlanLimit(bookingData.insuranceId);
          if (!withinInsuranceLimit) {
            throw new Error("Limite de agendamentos para este convênio foi atingido.");
          }
        }
      }
      
      // Log complete data right before creating the appointment
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
      
      // Create appointmentData object with all required fields
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
        service_id: bookingData.serviceId || null,
        free_tier_used: !isAdminView // Track that this counts against free tier limits
      };
      
      console.log("Sending final appointment data to API:", JSON.stringify(appointmentData, null, 2));
      
      const { data, error } = await createAppointment(appointmentData);
      
      if (error) {
        console.error("API returned error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Appointment created successfully:", data[0]);
        toast.success("Agendamento realizado com sucesso!");
        
        // Update bookingData with the real appointmentId from the API
        const newAppointmentId = data[0].id;
        bookingData.appointmentId = newAppointmentId;
        
        // Move to confirmation step and update with appointment ID
        goToStep("confirmation");
        
        // Return successful completion
        return true;
      } else {
        console.error("No data returned from API");
        throw new Error("Erro ao criar agendamento: Nenhum dado retornado");
      }
      
      return false;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      const errorMessage = error.message || "Erro ao processar agendamento";
      updateErrorState(errorMessage);
      toast.error(errorMessage);
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
