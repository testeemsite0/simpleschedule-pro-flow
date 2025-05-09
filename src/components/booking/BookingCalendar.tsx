import React from 'react';
import { Card } from '@/components/ui/card';
import { TimeSlot, Appointment, Professional } from '@/types';
import { ProfessionalStep } from './steps/ProfessionalStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { ServiceStep } from './steps/ServiceStep';
import { DateStep } from './steps/DateStep';
import { TimeStep } from './steps/TimeStep';
import { BookingSelectionSummary } from './BookingSelectionSummary';
import { useBookingCalendar } from '@/hooks/useBookingCalendar';
import { BookingStepsHeader } from './BookingStepsHeader';
import { BookingStepsContent } from './BookingStepsContent';
import { ErrorState, LoadingState, LimitState, NoTeamMembersState } from './BookingStates';

interface BookingCalendarProps {
  professional: Professional;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  professional,
  timeSlots,
  appointments,
  onSelectSlot
}) => {
  const {
    selectedDate,
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
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateSelect,
    goToPreviousStep,
  } = useBookingCalendar({
    professionalId: professional.id,
    timeSlots,
    appointments
  });
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    // Always pass the selectedTeamMember to ensure consistency
    console.log("Slot selected:", { date, startTime, endTime, teamMemberId: selectedTeamMember });
    onSelectSlot(date, startTime, endTime, selectedTeamMember);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (isOverLimit) {
    return <LimitState />;
  }

  // Debug logging
  console.log("Booking calendar rendering with:", { 
    teamMembers, 
    services,
    insurancePlans,
    selectedTeamMember,
    currentStep,
    error
  });

  // Filter services for selected team member
  const teamMemberServices = services.filter(service => {
    // If no team member is selected, show all services
    if (!selectedTeamMember) return true;
    // Otherwise, filter services that this team member can provide
    // This is a placeholder, as we don't have actual service-to-team-member mapping
    return true; // Replace with actual filtering logic
  });
  
  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <BookingStepsHeader currentStep={currentStep} />
      
      {/* Error message if any */}
      {error && <ErrorState error={error} />}

      {/* Debug info if there's no team members */}
      {teamMembers.length === 0 && currentStep === 1 && !loading && (
        <NoTeamMembersState />
      )}

      {/* Content area with steps */}
      <BookingStepsContent>
        {/* Step 1: Select Professional */}
        {currentStep === 1 && (
          <ProfessionalStep 
            teamMembers={teamMembers}
            selectedTeamMember={selectedTeamMember}
            onTeamMemberChange={handleTeamMemberChange}
          />
        )}
        
        {/* Step 2: Select Insurance */}
        {currentStep === 2 && selectedTeamMember && (
          <InsuranceStep
            insurancePlans={insurancePlans}
            selectedInsurance={selectedInsurance}
            onInsuranceChange={handleInsuranceChange}
            onBack={goToPreviousStep}
          />
        )}
        
        {/* Step 3: Select Service */}
        {currentStep === 3 && selectedInsurance && (
          <ServiceStep
            services={teamMemberServices}
            selectedService={selectedService}
            onServiceChange={handleServiceChange}
            onBack={goToPreviousStep}
            insuranceId={selectedInsurance}
          />
        )}
        
        {/* Step 4: Select Date */}
        {currentStep === 4 && selectedService && (
          <DateStep
            availableDates={availableDates}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onBack={goToPreviousStep}
          />
        )}
        
        {/* Step 5: Select Time */}
        {currentStep === 5 && selectedDate && (
          <TimeStep
            availableSlots={availableSlots}
            onTimeSlotSelect={handleTimeSlotSelect}
            onBack={goToPreviousStep}
          />
        )}
      </BookingStepsContent>
      
      {/* Selection summary */}
      {selectedTeamMember && (
        <BookingSelectionSummary
          selectedTeamMember={selectedTeamMember}
          selectedService={selectedService}
          selectedInsurance={selectedInsurance}
          selectedDate={selectedDate}
          teamMembers={teamMembers}
          services={services}
          insurancePlans={insurancePlans}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
