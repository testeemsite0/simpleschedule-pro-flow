
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnifiedBooking } from "@/context/UnifiedBookingContext";
import { BookingStepIndicator } from "./BookingStepIndicator";
import { ProfessionalStep } from "./steps/ProfessionalStep";
import { ServiceStep } from "./steps/ServiceStep";
import { InsuranceStep } from "./steps/InsuranceStep";
import { DateStep } from "./steps/DateStep";
import { TimeStep } from "./steps/TimeStep";
import { ErrorHandler } from "@/components/ui/error-handler";
import { MaintenanceNotice } from "./MaintenanceNotice";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface UnifiedBookingFormProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
}

interface Step {
  id: number;
  label: string;
}

export const UnifiedBookingForm: React.FC<UnifiedBookingFormProps> = ({
  title = "Agendar Consulta",
  showStepIndicator = true,
  isAdminView = false,
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
    goToPreviousStep,
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    resetBooking,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
  } = useUnifiedBooking();

  // If maintenance mode is active and not an admin view
  if (maintenanceMode && !isAdminView) {
    return <MaintenanceNotice />;
  }

  // Define booking steps - Updated order: Professional → Insurance → Service
  const steps: Step[] = [
    { id: 1, label: "Profissional" },
    { id: 2, label: "Convênio" },
    { id: 3, label: "Serviço" },
    { id: 4, label: "Data" },
    { id: 5, label: "Horário" },
  ];

  // Filter services available for the selected team member
  const filteredServices = bookingData.teamMemberId
    ? getAvailableServicesForTeamMember(bookingData.teamMemberId)
    : services;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <ErrorHandler
            error={error}
            resetError={resetBooking}
            title="Erro no agendamento"
          />
        )}

        {/* Step indicator */}
        {showStepIndicator && (
          <div className="sticky top-0 bg-white z-10 pb-4">
            <BookingStepIndicator
              steps={steps}
              currentStep={currentStep === "team-member" ? 1 : 
                currentStep === "insurance" ? 2 :
                currentStep === "service" ? 3 :
                currentStep === "date" ? 4 :
                currentStep === "time" ? 5 : 1}
            />
          </div>
        )}

        {/* Current step content */}
        <div className="space-y-6">
          {currentStep === "team-member" && (
            <ProfessionalStep
              teamMembers={teamMembers}
              selectedTeamMember={bookingData.teamMemberId}
              onTeamMemberChange={setTeamMember}
            />
          )}

          {currentStep === "insurance" && bookingData.teamMemberId && (
            <>
              {insurancePlans.map(plan => (
                plan.limit_per_plan && plan.current_appointments >= plan.limit_per_plan ? (
                  <div key={plan.id} className="mb-2">
                    <StatusIndicator variant="limit">
                      Limite atingido para o plano {plan.name}
                    </StatusIndicator>
                  </div>
                ) : null
              ))}
              
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
        </div>
      </CardContent>
    </Card>
  );
};
