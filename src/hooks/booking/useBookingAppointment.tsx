
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { BookingData } from './useBookingSteps';
import { createAppointment } from './api/dataFetcher';
import { useAppointments } from '@/context/AppointmentContext';
import { getAppointmentDateString } from '@/utils/timezone';
import { supabase } from '@/integrations/supabase/client';

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
  const isProcessing = useRef(false); // Prevent duplicate submissions

  // Check for existing appointment at the same time slot
  const checkAppointmentConflict = async () => {
    if (!professionalId || !bookingData.date || !bookingData.startTime || !bookingData.teamMemberId) {
      return false;
    }

    try {
      const formattedDate = getAppointmentDateString(bookingData.date);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('team_member_id', bookingData.teamMemberId)
        .eq('date', formattedDate)
        .eq('start_time', bookingData.startTime)
        .eq('status', 'scheduled');

      if (error) {
        console.error('Error checking appointment conflict:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in conflict check:', error);
      return false;
    }
  };

  // Complete booking process with enhanced validation and timezone handling
  const completeBooking = async () => {
    // Prevent duplicate submissions
    if (isProcessing.current || isLoading) {
      console.log("Booking already in progress, ignoring duplicate request");
      return false;
    }

    // Check if appointment already exists
    if (bookingData.appointmentId) {
      console.log("Appointment already exists, ignoring duplicate request");
      return true;
    }

    isProcessing.current = true;
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

      // Check for appointment conflicts
      const hasConflict = await checkAppointmentConflict();
      if (hasConflict) {
        throw new Error("Já existe um agendamento para este profissional nesta data e horário. Por favor, escolha outro horário.");
      }
      
      // Use proper timezone handling for date formatting
      const formattedDate = getAppointmentDateString(bookingData.date);
      console.log("Formatted date for appointment:", formattedDate);
      
      // Check appointment limits based on context (admin vs public)
      console.log("Checking appointment limits for professional:", professionalId);
      
      const withinFreeLimit = await isWithinFreeLimit(professionalId);
      console.log("Free limit check result:", withinFreeLimit);
      
      if (!withinFreeLimit) {
        // Different messages based on context
        const limitErrorMessage = isAdminView 
          ? "Você atingiu o limite de agendamentos do seu plano. Faça upgrade para continuar criando agendamentos."
          : "A agenda está temporariamente cheia. Este profissional atingiu o limite de agendamentos mensais. Tente novamente no próximo mês ou entre em contato diretamente.";
        
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
        insuranceId: bookingData.insuranceId === "none" ? null : bookingData.insuranceId || null,
        context: isAdminView ? 'admin' : 'public'
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
        free_tier_used: true // Always count against free tier limits
      };
      
      console.log("Sending final appointment data to API:", JSON.stringify(appointmentData, null, 2));
      
      const { data, error } = await createAppointment(appointmentData);
      
      if (error) {
        console.error("API returned error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Appointment created successfully:", data[0]);
        
        const successMessage = isAdminView 
          ? "Agendamento criado com sucesso!"
          : "Agendamento realizado com sucesso! Você receberá uma confirmação por email.";
        
        toast.success(successMessage);
        
        // Update bookingData with the real appointmentId from the API
        const newAppointmentId = data[0].id;
        bookingData.appointmentId = newAppointmentId;
        
        // Call onSuccess to trigger data refresh
        if (onSuccess) {
          onSuccess();
        }
        
        // Move to confirmation step
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
      
      // Don't show toast if error message is already shown in UI
      if (!errorMessage.includes("limite") && !errorMessage.includes("existe")) {
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  };

  return {
    isLoading,
    completeBooking
  };
};
