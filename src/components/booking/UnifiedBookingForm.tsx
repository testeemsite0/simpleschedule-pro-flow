
import React from 'react';
import { ProfessionalStep } from './steps/ProfessionalStep';
import { ServiceStep } from './steps/ServiceStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { TimeStep } from './steps/TimeStep';
import { ClientInfoStep } from './steps/ClientInfoStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingStepIndicator } from './BookingStepIndicator';
import { MaintenanceNotice } from './MaintenanceNotice';
import { BookingErrorHandler } from './BookingErrorHandler';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
            services={services}
            selectedService={bookingData.serviceId || ''}
            onServiceChange={handleServiceChange}
            isLoading={isLoading}
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
            onTimeSlotSelect={(date, startTime, endTime) => {
              setDate(date);
              setTime(startTime, endTime);
            }}
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
      {showStepIndicator && (
        <BookingStepIndicator currentStep={currentStep} />
      )}
      {maintenanceMode && <MaintenanceNotice />}
      <BookingErrorHandler error={error} onRetry={resetBooking} />
      
      <div className="mt-4">
        {renderCurrentStep()}
      </div>
      
      <div className="flex justify-between">
        {currentStep !== 'team-member' && currentStep !== 'confirmation' && (
          <button
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            Voltar
          </button>
        )}
        {currentStep !== 'confirmation' ? (
          <button
            onClick={goToNextStep}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            disabled={isLoading}
          >
            Avançar
          </button>
        ) : (
          <button
            onClick={handleCompleteBooking}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            disabled={isLoading}
          >
            Confirmar Agendamento
          </button>
        )}
      </div>
    </div>
  );
};
