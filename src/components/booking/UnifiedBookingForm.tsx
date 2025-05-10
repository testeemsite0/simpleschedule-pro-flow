import React from 'react';
import { ProfessionalStep } from './steps/ProfessionalStep';
import { ServiceStep } from './steps/ServiceStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { TimeStep } from './steps/TimeStep';
import { ClientInfoStep } from '@/components/booking/steps/ClientInfoStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingStepIndicator } from './BookingStepIndicator';
import { MaintenanceNotice } from './MaintenanceNotice';
import { BookingErrorHandler } from './BookingErrorHandler';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
  
  const handleTeamMemberChange = (teamMemberId: string) => {
    setTeamMember(teamMemberId);
  };
  
  const handleServiceChange = (serviceId: string) => {
    setService(serviceId);
  };
  
  const handleInsuranceChange = (insuranceId: string) => {
    setInsurance(insuranceId);
  };
  
  const handleDateChange = (date: Date) => {
    setDate(date);
  };
  
  const handleTimeChange = (startTime: string, endTime: string) => {
    setTime(startTime, endTime);
  };
  
  const handleClientInfoSubmit = (name: string, email: string, phone: string, notes?: string) => {
    setClientInfo(name, email, phone, notes);
  };
  
  const handleCompleteBooking = async () => {
    const success = await completeBooking();
    if (success) {
      // Additional success handling can be added here
    }
  };
  
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Atualizando",
      description: "Recarregando dados do sistema"
    });
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'team-member':
        return (
          <ProfessionalStep
            teamMembers={teamMembers}
            selectedTeamMember={bookingData.teamMemberId || ''}
            onTeamMemberChange={handleTeamMemberChange}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        );
      case 'service':
        return (
          <ServiceStep
            services={getAvailableServicesForTeamMember(bookingData.teamMemberId || '')}
            selectedService={bookingData.serviceId || ''}
            onServiceChange={handleServiceChange}
            onBack={goToPreviousStep}
          />
        );
      case 'insurance':
        return (
          <InsuranceStep
            insurancePlans={insurancePlans}
            selectedInsurance={bookingData.insuranceId || ''}
            onInsuranceChange={handleInsuranceChange}
            onBack={goToPreviousStep}
          />
        );
      case 'time':
        return (
          <TimeStep
            availableSlots={availableSlots}
            selectedDate={bookingData.date}
            selectedStartTime={bookingData.startTime}
            selectedEndTime={bookingData.endTime}
            onTimeSlotSelect={(date, startTime, endTime) => {
              handleDateChange(date);
              handleTimeChange(startTime, endTime);
            }}
            isLoading={isLoading}
            onBack={goToPreviousStep}
          />
        );
      case 'client-info':
        return (
          <ClientInfoStep
            onClientInfoSubmit={handleClientInfoSubmit}
            isLoading={isLoading}
            onBack={goToPreviousStep}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            bookingData={bookingData}
            onConfirm={handleCompleteBooking}
            onEdit={goToPreviousStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
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
        />
      )}
      
      <div className="mt-4">
        {renderCurrentStep()}
      </div>
      
      <div className="flex justify-between">
        {currentStep !== 'team-member' && currentStep !== 'confirmation' && (
          <Button
            onClick={goToPreviousStep}
            variant="outline"
            disabled={isLoading}
          >
            Voltar
          </Button>
        )}
        {currentStep !== 'confirmation' ? (
          <Button
            onClick={goToNextStep}
            disabled={isLoading}
          >
            Avançar
          </Button>
        ) : (
          <Button
            onClick={handleCompleteBooking}
            variant="default"
            className="bg-green-500 hover:bg-green-700"
            disabled={isLoading}
          >
            Confirmar Agendamento
          </Button>
        )}
      </div>
    </div>
  );
};
