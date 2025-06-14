
import { useBookingSteps } from '../useBookingSteps';
import { useBookingServices } from '../useBookingServices';
import { useBookingAppointment } from '../useBookingAppointment';
import { useAvailabilityCalculation } from '../useAvailabilityCalculation';
import { BookingStep } from '../useBookingSteps';

interface UseBookingStateProps {
  resolvedProfessionalId?: string;
  services: any[];
  insurancePlans: any[];
  timeSlots: any[];
  appointments: any[];
  isAdminView?: boolean;
  initialStep?: BookingStep;
}

export const useBookingState = ({
  resolvedProfessionalId,
  services,
  insurancePlans,
  timeSlots,
  appointments,
  isAdminView = false,
  initialStep
}: UseBookingStateProps) => {
  const bookingSteps = useBookingSteps({
    initialStep: initialStep || "team-member"
  });

  const {
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  } = useBookingServices({
    services,
    insurancePlans
  });

  const {
    availableDates,
    availableSlots
  } = useAvailabilityCalculation({
    timeSlots,
    appointments,
    teamMemberId: bookingSteps.bookingData.teamMemberId,
    date: bookingSteps.bookingData.date
  });

  const {
    isLoading: appointmentLoading,
    completeBooking
  } = useBookingAppointment({
    professionalId: resolvedProfessionalId,
    isAdminView,
    bookingData: bookingSteps.bookingData,
    onSuccess: () => {},
    goToStep: bookingSteps.goToStep,
    updateErrorState: bookingSteps.updateErrorState,
    resetBooking: bookingSteps.resetBooking
  });

  return {
    ...bookingSteps,
    availableDates,
    availableSlots,
    isLoading: appointmentLoading,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
    completeBooking
  };
};
