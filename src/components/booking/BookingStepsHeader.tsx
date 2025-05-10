
import React from 'react';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStep } from '@/hooks/booking/useBookingSteps';
import { getCurrentStepNumber } from './forms/BookingStepsDefinition';

interface BookingStepsHeaderProps {
  currentStep: BookingStep | number;
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
  
  // Convert number to BookingStep if needed
  const bookingStep = typeof currentStep === 'number' 
    ? (currentStep === 1 ? 'team-member' as BookingStep :
       currentStep === 2 ? 'insurance' as BookingStep :
       currentStep === 3 ? 'service' as BookingStep :
       currentStep === 4 ? 'date' as BookingStep :
       currentStep === 5 ? 'time' as BookingStep : 'team-member' as BookingStep)
    : currentStep;
  
  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <BookingStepIndicator currentStep={bookingStep} />
    </div>
  );
};
