
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingStep, BookingData } from '@/hooks/booking/useBookingSteps';

interface BookingNavigationButtonsProps {
  currentStep: BookingStep;
  bookingData: BookingData;
  isLoading: boolean;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  handleCompleteBooking: () => void;
}

export const BookingNavigationButtons: React.FC<BookingNavigationButtonsProps> = ({
  currentStep,
  bookingData,
  isLoading,
  goToPreviousStep,
  goToNextStep,
  handleCompleteBooking
}) => {
  // Determine if we can advance to next step based on current step and data
  const canAdvance = () => {
    switch (currentStep) {
      case 'team-member':
        return !!bookingData.teamMemberId;
      case 'service':
        return !!bookingData.serviceId;
      case 'insurance':
        return !!bookingData.insuranceId;
      case 'date':
        return !!bookingData.date;
      case 'time':
        return !!bookingData.startTime && !!bookingData.endTime;
      case 'client-info':
        return !!bookingData.clientName && !!bookingData.clientEmail;
      default:
        return false;
    }
  };

  // Show confirmation button only on confirmation step
  const showConfirmButton = currentStep === 'confirmation';
  
  // Show next button for all steps except confirmation and client-info (which handles its own advancement)
  const showNextButton = !showConfirmButton && currentStep !== 'client-info';

  return (
    <div className="flex justify-between pt-4 border-t">
      {/* Show back button if not on first step */}
      {currentStep !== 'team-member' && (
        <Button
          onClick={goToPreviousStep}
          variant="outline"
          disabled={isLoading}
        >
          Voltar
        </Button>
      )}
      
      {/* Show next button for most steps */}
      {showNextButton && (
        <Button
          onClick={goToNextStep}
          disabled={isLoading || !canAdvance()}
          className="ml-auto"
        >
          Avançar
        </Button>
      )}
      
      {/* Show confirm button only on confirmation step */}
      {showConfirmButton && (
        <Button
          onClick={handleCompleteBooking}
          variant="default"
          className="bg-green-500 hover:bg-green-700 ml-auto"
          disabled={isLoading}
        >
          {isLoading ? 'Processando...' : 'Confirmar Agendamento'}
        </Button>
      )}
    </div>
  );
};
