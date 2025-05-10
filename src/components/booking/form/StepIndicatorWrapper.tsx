
import React from 'react';
import { BookingStepIndicator } from '../BookingStepIndicator';
import { BookingStep } from '@/hooks/booking/useBookingSteps';
import { getCurrentStepNumber } from '../forms/BookingStepsDefinition';

interface StepIndicatorWrapperProps {
  currentStep: BookingStep | number;
  steps: { id: number; key: string; label: string }[];
}

export const StepIndicatorWrapper: React.FC<StepIndicatorWrapperProps> = ({
  currentStep,
  steps
}) => {
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
      <BookingStepIndicator 
        currentStep={bookingStep}
      />
    </div>
  );
};
