
import React from 'react';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingStepsHeaderProps {
  currentStep: BookingStep;
}

export const BookingStepsHeader: React.FC<BookingStepsHeaderProps> = ({ currentStep }) => {
  // Define booking steps
  const steps = [
    { id: 1, key: 'team-member', label: 'Profissional' },
    { id: 2, key: 'insurance', label: 'Convênio' },
    { id: 3, key: 'service', label: 'Serviço' },
    { id: 4, key: 'date', label: 'Data' },
    { id: 5, key: 'time', label: 'Horário' }
  ];
  
  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <BookingStepIndicator currentStep={currentStep} />
    </div>
  );
};
