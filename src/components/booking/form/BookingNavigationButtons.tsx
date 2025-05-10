
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
  // Only show next button on client-info step, which is the final step before confirmation
  const shouldShowNextButton = currentStep === 'client-info';
    
  // Only show confirmation button in confirmation step
  const showConfirmButton = currentStep === 'confirmation';
  
  // Auto-advancing steps should not show the next button
  const isAutoAdvancingStep = ['team-member', 'insurance', 'service'].includes(currentStep);

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
      
      {!isAutoAdvancingStep && shouldShowNextButton && !showConfirmButton && (
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
