
import React from 'react';
import { BookingStepIndicator } from './BookingStepIndicator';

interface BookingStepsHeaderProps {
  currentStep: number;
}

export const BookingStepsHeader: React.FC<BookingStepsHeaderProps> = ({ currentStep }) => {
  // Define booking steps
  const steps = [
    { id: 1, label: 'Profissional' },
    { id: 2, label: 'Convênio' },
    { id: 3, label: 'Serviço' },
    { id: 4, label: 'Data' },
    { id: 5, label: 'Horário' }
  ];
  
  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <BookingStepIndicator steps={steps} currentStep={currentStep} />
    </div>
  );
};
