
import React from 'react';
import { Button } from '@/components/ui/button';

interface BookingStepNavigatorProps {
  currentStep: number;
  isLoading: boolean;
  insuranceLimitError: string | null;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BookingStepNavigator: React.FC<BookingStepNavigatorProps> = ({
  currentStep,
  isLoading,
  insuranceLimitError,
  onNext,
  onPrevious,
  onCancel,
  onSubmit
}) => {
  if (currentStep === 1) {
    return (
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
        >
          Próximo
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex justify-between">
      <Button 
        type="button" 
        variant="outline"
        onClick={onPrevious}
      >
        Voltar
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || !!insuranceLimitError}
      >
        {isLoading ? 'Enviando...' : 'Confirmar agendamento'}
      </Button>
    </div>
  );
};
