
import { useCallback } from 'react';
import { useBookingDataLoader } from './core/useBookingDataLoader';
import { useBookingState } from './core/useBookingState';
import { BookingStep } from './useBookingSteps';

interface UseUnifiedBookingFlowProps {
  professionalId?: string;
  professionalSlug?: string;
  isAdminView?: boolean;
  initialStep?: BookingStep;
}

export const useUnifiedBookingFlow = ({
  professionalId,
  professionalSlug,
  isAdminView = false,
  initialStep
}: UseUnifiedBookingFlowProps = {}) => {
  
  // Data loading logic
  const {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    resolvedProfessionalId,
    maintenanceMode,
    setMaintenanceMode,
    isLoading: dataLoading,
    dataError,
    refreshData
  } = useBookingDataLoader({
    professionalId,
    professionalSlug,
    onError: (error) => {
      console.error("useUnifiedBookingFlow: Booking data error:", error);
    }
  });

  // Booking state logic
  const bookingState = useBookingState({
    resolvedProfessionalId,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    isAdminView,
    initialStep
  });

  const resetBooking = useCallback(() => {
    bookingState.resetBooking();
    refreshData();
  }, [bookingState, refreshData]);

  // Unified loading indicator
  const isLoading = dataLoading || bookingState.isLoading;
  
  return {
    ...bookingState,
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    isLoading,
    error: bookingState.error || dataError,
    setMaintenanceMode,
    resetBooking,
    refreshData,
    resolvedProfessionalId
  };
};
