
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingNavigationButtonsProps {
  currentStep: BookingStep;
  isLoading: boolean;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  handleCompleteBooking: () => void;
  showNextButton?: boolean;
}

export const BookingNavigationButtons: React.FC<BookingNavigationButtonsProps> = ({
  currentStep,
  isLoading,
  goToPreviousStep,
  goToNextStep,
  handleCompleteBooking,
  showNextButton = false
}) => {
  // Don't show buttons for steps that auto-advance (team-member, insurance, service)
  const shouldShowNextButton = showNextButton || 
    ['date', 'time', 'client-info'].includes(currentStep);
    
  // Only show confirmation button in confirmation step
  const showConfirmButton = currentStep === 'confirmation';

  return (
    <div className="flex justify-between">
      {currentStep !== 'team-member' && (
        <Button
          onClick={goToPreviousStep}
          variant="outline"
          disabled={isLoading}
        >
          Voltar
        </Button>
      )}
      
      {shouldShowNextButton && !showConfirmButton && (
        <Button
          onClick={goToNextStep}
          disabled={isLoading}
          className="ml-auto"
        >
          Avançar
        </Button>
      )}
      
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
