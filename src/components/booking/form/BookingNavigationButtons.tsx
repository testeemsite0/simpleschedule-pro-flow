
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingNavigationButtonsProps {
  currentStep: BookingStep;
  isLoading: boolean;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  handleCompleteBooking: () => void;
}

export const BookingNavigationButtons: React.FC<BookingNavigationButtonsProps> = ({
  currentStep,
  isLoading,
  goToPreviousStep,
  goToNextStep,
  handleCompleteBooking
}) => {
  return (
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
  );
};
