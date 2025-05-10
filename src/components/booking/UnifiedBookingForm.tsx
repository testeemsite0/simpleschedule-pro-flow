
import React from 'react';
import { BookingStepIndicator } from './BookingStepIndicator';
import { MaintenanceNotice } from './MaintenanceNotice';
import { BookingErrorHandler } from './BookingErrorHandler';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { useBookingHandlers } from '@/hooks/booking/useBookingHandlers';
import { BookingStepContent } from './form/BookingStepContent';
import { BookingNavigationButtons } from './form/BookingNavigationButtons';
import { Button } from '@/components/ui/button';

interface UnifiedBookingFormProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
  allowWalkIn?: boolean;
}

export const UnifiedBookingForm: React.FC<UnifiedBookingFormProps> = ({
  title,
  showStepIndicator = false,
  isAdminView = false,
  allowWalkIn = false,
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
    error,
    maintenanceMode,
    goToNextStep,
    goToPreviousStep,
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
    handleRefresh
  } = useBookingHandlers({
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    completeBooking,
    refreshData
  });
  
  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      
      {showStepIndicator && (
        <BookingStepIndicator currentStep={currentStep} />
      )}
      {maintenanceMode && <MaintenanceNotice />}

      {error && (
        <BookingErrorHandler 
          error={error} 
          onRetry={resetBooking} 
        />
      )}
      
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
          handleCompleteBooking={handleCompleteBooking}
          goToPreviousStep={goToPreviousStep}
          getAvailableServicesForTeamMember={getAvailableServicesForTeamMember}
          checkInsuranceLimitReached={checkInsuranceLimitReached}
          handleRefresh={handleRefresh}
        />
      </div>
      
      <BookingNavigationButtons 
        currentStep={currentStep}
        isLoading={isLoading}
        goToPreviousStep={goToPreviousStep}
        goToNextStep={goToNextStep}
        handleCompleteBooking={handleCompleteBooking}
      />
    </div>
  );
};
