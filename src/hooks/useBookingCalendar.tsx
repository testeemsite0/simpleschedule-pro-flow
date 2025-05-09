
import { TimeSlot, Appointment, Professional } from '@/types';
import { useBookingCalendarData } from './booking/useBookingCalendarData';
import { useBookingCalendarSteps } from './booking/useBookingCalendarSteps';
import { useBookingSlots } from './booking/useBookingSlots';

interface UseBookingCalendarProps {
  professionalId: string;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
}

export const useBookingCalendar = ({ 
  professionalId, 
  timeSlots, 
  appointments 
}: UseBookingCalendarProps) => {
  // Fetch professional data
  const {
    teamMembers,
    services,
    insurancePlans,
    loading,
    error,
    isOverLimit
  } = useBookingCalendarData({ professionalId });
  
  // Handle steps navigation
  const {
    currentStep,
    selectedTeamMember,
    selectedService,
    selectedInsurance,
    selectedDate: stepSelectedDate,
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateSelect,
    goToPreviousStep
  } = useBookingCalendarSteps();
  
  // Handle availability calculations
  const {
    availableDates,
    availableSlots,
    selectedDate,
    filteredTimeSlots
  } = useBookingSlots({
    timeSlots,
    appointments,
    selectedTeamMember,
    selectedService,
    isOverLimit,
    currentStep
  });
  
  // Merge the date from steps and slots
  const effectiveSelectedDate = stepSelectedDate || selectedDate;

  console.log("useBookingCalendar: Current state", {
    currentStep,
    selectedTeamMember,
    selectedInsurance,
    selectedService,
    availableDatesLength: availableDates?.length,
    effectiveSelectedDate
  });

  return {
    selectedDate: effectiveSelectedDate,
    availableDates,
    availableSlots,
    teamMembers,
    services,
    selectedTeamMember,
    selectedService,
    selectedInsurance,
    insurancePlans,
    isOverLimit,
    loading,
    currentStep,
    error,
    filteredTimeSlots,
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateSelect,
    goToPreviousStep,
  };
};
