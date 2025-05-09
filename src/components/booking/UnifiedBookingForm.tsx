
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnifiedBooking } from "@/context/UnifiedBookingContext";
import { ProfessionalStep } from "./steps/ProfessionalStep";
import { ServiceStep } from "./steps/ServiceStep";
import { InsuranceStep } from "./steps/InsuranceStep";
import { DateStep } from "./steps/DateStep";
import { TimeStep } from "./steps/TimeStep";
import { MaintenanceNotice } from "./MaintenanceNotice";
import { BookingStepContainer } from "./forms/BookingStepContainer";
import { ClientInfoForm } from "./forms/ClientInfoForm";
import { BookingErrorHandler } from "./forms/BookingErrorHandler";
import { InsuranceLimitWarning } from "./forms/InsuranceLimitWarning";
import { WalkInButton } from "./forms/WalkInButton";
import { getBookingSteps, getCurrentStepNumber } from "./forms/BookingStepsDefinition";

interface UnifiedBookingFormProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
  allowWalkIn?: boolean;
}

export const UnifiedBookingForm: React.FC<UnifiedBookingFormProps> = ({
  title = "Agendar Consulta",
  showStepIndicator = true,
  isAdminView = false,
  allowWalkIn = false,
}) => {
  const {
    currentStep,
    error,
    teamMembers,
    services,
    insurancePlans,
    availableDates,
    availableSlots,
    maintenanceMode,
    bookingData,
    isLoading,
    goToPreviousStep,
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    resetBooking,
    completeBooking,
    getAvailableServicesForTeamMember,
  } = useUnifiedBooking();

  // Handle Walk-in appointment
  const handleWalkIn = () => {
    if (currentStep === "team-member" && allowWalkIn && isAdminView) {
      // Set current date and time for immediate appointment
      const now = new Date();
      setDate(now);
      // Skip to client info step
      // This is a special case for walk-ins
    }
  };

  // Handle client form submission
  const handleClientSubmit = (name: string, email: string, phone: string, notes: string) => {
    setClientInfo(name, email, phone, notes);
    completeBooking();
  };

  // If maintenance mode is active and not an admin view
  if (maintenanceMode && !isAdminView) {
    return <MaintenanceNotice />;
  }

  // Get steps and current step number
  const steps = getBookingSteps();
  const currentStepNumber = getCurrentStepNumber(currentStep);

  // Filter services available for the selected team member
  const filteredServices = bookingData.teamMemberId
    ? getAvailableServicesForTeamMember(bookingData.teamMemberId)
    : services;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <WalkInButton
            show={allowWalkIn && isAdminView && currentStep === "team-member"}
            onClick={handleWalkIn}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BookingErrorHandler
          error={error}
          resetError={resetBooking}
        />

        <BookingStepContainer
          title={title}
          currentStep={currentStepNumber}
          steps={steps}
          showStepIndicator={showStepIndicator}
        >
          {currentStep === "team-member" && (
            <ProfessionalStep
              teamMembers={teamMembers}
              selectedTeamMember={bookingData.teamMemberId}
              onTeamMemberChange={setTeamMember}
              isLoading={isLoading}
            />
          )}

          {currentStep === "insurance" && bookingData.teamMemberId && (
            <>
              <InsuranceLimitWarning insurancePlans={insurancePlans} />
              <InsuranceStep
                insurancePlans={insurancePlans}
                selectedInsurance={bookingData.insuranceId}
                onInsuranceChange={setInsurance}
                onBack={goToPreviousStep}
              />
            </>
          )}

          {currentStep === "service" && bookingData.insuranceId && (
            <ServiceStep
              services={filteredServices}
              selectedService={bookingData.serviceId}
              onServiceChange={setService}
              onBack={goToPreviousStep}
              insuranceId={bookingData.insuranceId}
            />
          )}

          {currentStep === "date" && bookingData.serviceId && (
            <DateStep
              availableDates={availableDates || []}
              selectedDate={bookingData.date || null}
              onDateSelect={setDate}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === "time" && bookingData.date && (
            <TimeStep
              availableSlots={availableSlots || []}
              onTimeSlotSelect={(date, startTime, endTime, teamMemberId) => 
                setTime(startTime, endTime)
              }
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === "client-info" && (
            <ClientInfoForm
              onSubmit={handleClientSubmit}
              onBack={goToPreviousStep}
              isLoading={isLoading}
            />
          )}
        </BookingStepContainer>
      </CardContent>
    </Card>
  );
};
