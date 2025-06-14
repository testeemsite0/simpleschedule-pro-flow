
import React, { useEffect } from 'react';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { useBookingHandlers } from '@/hooks/booking/useBookingHandlers';
import { BookingStepContent } from '../form/BookingStepContent';
import { BookingNavigationButtons } from '../form/BookingNavigationButtons';
import { BookingDataLoader } from './BookingDataLoader';

interface BookingFormContentProps {
  allowWalkIn?: boolean;
  onSuccess?: () => void;
}

export const BookingFormContent: React.FC<BookingFormContentProps> = ({
  allowWalkIn = false,
  onSuccess
}) => {
  const { 
    currentStep, 
    bookingData,
    teamMembers,
    services,
    insurancePlans,
    availableDates,
    availableSlots,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    completeBooking,
    resetBooking,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
    refreshData
  } = useUnifiedBooking();
  
  const {
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateChange,
    handleTimeChange,
    handleClientInfoSubmit,
    handleCompleteBooking,
    handleRefresh,
    handleBookingConclude
  } = useBookingHandlers({
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    completeBooking: async () => {
      const success = await completeBooking();
      if (success && onSuccess) {
        onSuccess();
      }
      return success;
    },
    refreshData,
    resetBooking,
    goToStep
  });
  
  // Force refresh if no team members are available but we're not loading
  useEffect(() => {
    if ((!teamMembers || teamMembers.length === 0) && !isLoading) {
      handleRefresh();
    }
  }, [teamMembers, isLoading, handleRefresh]);
  
  if (!teamMembers || teamMembers.length === 0) {
    return <BookingDataLoader onRefresh={handleRefresh} isLoading={isLoading} />;
  }
  
  return (
    <div className="mt-4">
      <BookingStepContent 
        currentStep={currentStep}
        bookingData={bookingData}
        teamMembers={teamMembers}
        services={services}
        insurancePlans={insurancePlans}
        availableDates={availableDates}
        availableSlots={availableSlots}
        isLoading={isLoading}
        handleTeamMemberChange={handleTeamMemberChange}
        handleServiceChange={handleServiceChange}
        handleInsuranceChange={handleInsuranceChange}
        handleDateChange={handleDateChange}
        handleTimeChange={handleTimeChange}
        handleClientInfoSubmit={handleClientInfoSubmit}
        handleCompleteBooking={handleBookingConclude}
        goToPreviousStep={goToPreviousStep}
        getAvailableServicesForTeamMember={getAvailableServicesForTeamMember}
        checkInsuranceLimitReached={checkInsuranceLimitReached}
        handleRefresh={handleRefresh}
      />
      
      <BookingNavigationButtons 
        currentStep={currentStep}
        bookingData={bookingData}
        isLoading={isLoading}
        goToPreviousStep={goToPreviousStep}
        goToNextStep={goToNextStep}
        handleCompleteBooking={handleCompleteBooking}
      />
    </div>
  );
};
