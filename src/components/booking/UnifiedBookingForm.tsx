
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

  // Se o modo de manutenção estiver ativado e não for visualização de administrador
  if (maintenanceMode && !isAdminView) {
    return <MaintenanceNotice />;
  }

  // Defina os passos do agendamento
  const steps = [
    { id: "team-member", label: "Profissional" },
    { id: "service", label: "Serviço" },
    { id: "insurance", label: "Convênio" },
    { id: "date", label: "Data" },
    { id: "time", label: "Horário" },
  ];

  // Filtra os serviços disponíveis para o profissional selecionado
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

        {/* Indicador de passos */}
        {showStepIndicator && (
          <div className="sticky top-0 bg-white z-10 pb-4">
            <BookingStepIndicator
              steps={steps}
              currentStep={currentStep}
            />
          </div>
        )}

        {/* Conteúdo do passo atual */}
        <div className="space-y-6">
          {currentStep === "team-member" && (
            <ProfessionalStep
              teamMembers={teamMembers}
              selectedTeamMember={bookingData.teamMemberId}
              onTeamMemberChange={setTeamMember}
            />
          )}

          {currentStep === "service" && bookingData.teamMemberId && (
            <ServiceStep
              services={filteredServices}
              selectedService={bookingData.serviceId}
              onServiceChange={setService}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === "insurance" && bookingData.serviceId && (
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

          {currentStep === "date" && bookingData.insuranceId && (
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

          {/* Você pode adicionar mais etapas conforme necessário */}
        </div>
      </CardContent>
    </Card>
  );
};
