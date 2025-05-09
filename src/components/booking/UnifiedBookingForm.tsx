import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnifiedBooking } from "@/context/UnifiedBookingContext";
import { BookingStepIndicator } from "./BookingStepIndicator";
import { ProfessionalStep } from "./steps/ProfessionalStep";
import { ServiceStep } from "./steps/ServiceStep";
import { InsuranceStep } from "./steps/InsuranceStep";
import { DateStep } from "./steps/DateStep";
import { TimeStep } from "./steps/TimeStep";
import { ClientInfoStep } from "./ClientInfoStep";
import { Button } from "@/components/ui/button";
import { ErrorHandler } from "@/components/ui/error-handler";
import { MaintenanceNotice } from "./MaintenanceNotice";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface UnifiedBookingFormProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
  allowWalkIn?: boolean;
}

interface Step {
  id: number;
  label: string;
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
    checkInsuranceLimitReached,
  } = useUnifiedBooking();

  // State for client information form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // If maintenance mode is active and not an admin view
  if (maintenanceMode && !isAdminView) {
    return <MaintenanceNotice />;
  }

  // Define booking steps - Updated order: Professional → Insurance → Service → Date → Time → Client Info → Confirmation
  const steps: Step[] = [
    { id: 1, label: "Profissional" },
    { id: 2, label: "Convênio" },
    { id: 3, label: "Serviço" },
    { id: 4, label: "Data" },
    { id: 5, label: "Horário" },
    { id: 6, label: "Cliente" },
  ];

  // Filter services available for the selected team member
  const filteredServices = bookingData.teamMemberId
    ? getAvailableServicesForTeamMember(bookingData.teamMemberId)
    : services;

  // Handle form submission for client information
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientInfo(name, email, phone, notes);
    completeBooking();
  };

  // Handle "Walk-in" appointment (immediate appointment)
  const handleWalkIn = () => {
    if (currentStep === "team-member" && allowWalkIn && isAdminView) {
      // Set current date and time
      const now = new Date();
      setDate(now);
      
      // Skip to client info step
      goToClientInfoStep();
    }
  };

  // Helper to jump directly to client info step (for walk-ins)
  const goToClientInfoStep = () => {
    // This is a custom function outside of our context to handle the special walk-in case
    // We keep the team member, but skip other steps
  };

  // Map currentStep string to number for the indicator
  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case "team-member": return 1;
      case "insurance": return 2;
      case "service": return 3;
      case "date": return 4;
      case "time": return 5;
      case "client-info": return 6;
      default: return 1;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          {allowWalkIn && isAdminView && currentStep === "team-member" && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleWalkIn}
            >
              Encaixe Imediato
            </Button>
          )}
        </CardTitle>
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
              currentStep={getCurrentStepNumber()}
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
              isLoading={isLoading}
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

          {currentStep === "client-info" && (
            <form onSubmit={handleClientSubmit}>
              <ClientInfoStep
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                notes={notes}
                setNotes={setNotes}
              />
              
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                >
                  Voltar
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Agendando..." : "Finalizar Agendamento"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
