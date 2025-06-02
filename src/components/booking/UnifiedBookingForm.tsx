
import React, { useEffect } from 'react';
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
  // This hook must be used within a UnifiedBookingProvider context
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
  
  // Log component rendering and data
  useEffect(() => {
    console.log("UnifiedBookingForm: Rendered with data:", {
      title,
      showStepIndicator,
      isAdminView,
      currentStep,
      teamMembersCount: teamMembers?.length || 0,
      servicesCount: services?.length || 0,
      isLoading,
      hasError: !!error
    });
    
    // Force refresh if no team members are available but we're not loading
    if ((!teamMembers || teamMembers.length === 0) && !isLoading) {
      console.log("UnifiedBookingForm: No team members available but not loading, forcing refresh");
      handleRefresh();
    }
  }, [teamMembers, isLoading, error, handleRefresh]);
  
  const handleForceRefresh = () => {
    console.log("UnifiedBookingForm: Force refreshing data");
    handleRefresh();
  };

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
          title="Erro no agendamento"
        />
      )}
      
      {!teamMembers || teamMembers.length === 0 ? (
        <div className="py-4 flex justify-center">
          <Button 
            onClick={handleForceRefresh}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Forçar atualização de dados"}
          </Button>
        </div>
      ) : null}
      
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
        bookingData={bookingData}
        isLoading={isLoading}
        goToPreviousStep={goToPreviousStep}
        goToNextStep={goToNextStep}
        handleCompleteBooking={handleCompleteBooking}
      />
    </div>
  );
};
