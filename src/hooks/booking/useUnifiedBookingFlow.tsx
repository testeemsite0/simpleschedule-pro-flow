
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useBookingSteps, BookingStep } from './useBookingSteps';
import { useBookingDataFetching } from './useBookingDataFetching';
import { useBookingServices } from './useBookingServices';
import { useBookingAppointment } from './useBookingAppointment';
import { useAvailabilityCalculation } from './useAvailabilityCalculation';
import { useMaintenanceMode } from './useMaintenanceMode';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';

interface UseUnifiedBookingFlowProps {
  professionalId?: string;
  isAdminView?: boolean;
  initialStep?: BookingStep;
}

export const useUnifiedBookingFlow = ({
  professionalId,
  isAdminView = false,
  initialStep
}: UseUnifiedBookingFlowProps = {}) => {
  // Use refactored hooks for better separation of concerns
  const bookingSteps = useBookingSteps({
    initialStep: initialStep || "team-member"
  });
  
  // Booking data fetching hook
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

  // Services-related utilities
  const {
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  } = useBookingServices({
    services,
    insurancePlans
  });
  
  // Availability calculations
  const {
    availableDates,
    availableSlots
  } = useAvailabilityCalculation({
    timeSlots,
    appointments,
    teamMemberId: bookingSteps.bookingData.teamMemberId,
    date: bookingSteps.bookingData.date
  });
  
  // Appointment creation hook
  const {
    isLoading: appointmentLoading,
    completeBooking
  } = useBookingAppointment({
    professionalId,
    isAdminView,
    bookingData: bookingSteps.bookingData,
    onSuccess: () => {
      // You can add more actions after success here if necessary
    },
    goToStep: bookingSteps.goToStep,
    updateErrorState: bookingSteps.updateErrorState
  });
  
  const resetBooking = () => {
    bookingSteps.resetBooking();
  };

  // Unified loading indicator
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
