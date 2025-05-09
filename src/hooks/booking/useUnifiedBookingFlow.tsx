
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useBookingSteps } from './useBookingSteps';
import { useBookingDataFetching } from './useBookingDataFetching';
import { useBookingServices } from './useBookingServices';
import { useBookingAppointment } from './useBookingAppointment';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';
import { format } from 'date-fns';

interface UseUnifiedBookingFlowProps {
  professionalId?: string;
  isAdminView?: boolean;
  initialStep?: string;
}

export const useUnifiedBookingFlow = ({
  professionalId,
  isAdminView = false,
  initialStep
}: UseUnifiedBookingFlowProps = {}) => {
  const bookingSteps = useBookingSteps({
    initialStep: initialStep || "team-member"
  });
  
  // Utilizamos os hooks refatorados para separação de responsabilidades
  const {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    setMaintenanceMode,
    isLoading: dataLoading,
    dataError
  } = useBookingDataFetching({
    professionalId
  });

  const {
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  } = useBookingServices({
    services,
    insurancePlans
  });

  // Estados adicionais
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  
  const {
    isLoading: appointmentLoading,
    completeBooking
  } = useBookingAppointment({
    professionalId,
    isAdminView,
    bookingData: bookingSteps.bookingData,
    onSuccess: () => {
      // Você pode adicionar mais ações após sucesso aqui se necessário
    },
    goToStep: bookingSteps.goToStep,
    updateErrorState: bookingSteps.updateErrorState
  });

  // Calculate availability when professional or relevant data changes
  useEffect(() => {
    // Calculate available dates based on timeSlots and appointments
    // Simplified implementation - just providing a week of dates for now
    const calculateAvailableDates = () => {
      const today = new Date();
      const dates = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
      return dates;
    };

    setAvailableDates(calculateAvailableDates());
    
    // Clear available time slots when professional changes
    setAvailableSlots([]);
  }, [professionalId, timeSlots, appointments]);

  // Update available slots when date is selected
  useEffect(() => {
    const calculateAvailableSlots = () => {
      if (!bookingSteps.bookingData.date || !bookingSteps.bookingData.teamMemberId) {
        return [];
      }
      
      // Simplified time slot calculation
      // In a real implementation, this would check against timeSlots and appointments
      const slots = [];
      const startHour = 8;
      const endHour = 18;
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        slots.push({
          date: bookingSteps.bookingData.date,
          startTime,
          endTime,
          teamMemberId: bookingSteps.bookingData.teamMemberId
        });
      }
      
      return slots;
    };
    
    if (bookingSteps.bookingData.date && bookingSteps.bookingData.teamMemberId) {
      setAvailableSlots(calculateAvailableSlots());
    }
  }, [bookingSteps.bookingData.date, bookingSteps.bookingData.teamMemberId]);
  
  const resetBooking = () => {
    bookingSteps.resetBooking();
    setAvailableSlots([]);
  };

  // Indicador de carregamento unificado
  const isLoading = dataLoading || appointmentLoading;
  
  return {
    ...bookingSteps,
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    availableDates,
    availableSlots,
    isLoading,
    error: bookingSteps.error || dataError,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
    completeBooking,
    setMaintenanceMode,
    resetBooking
  };
};
