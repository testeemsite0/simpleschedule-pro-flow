
import React from 'react';
import { BookingStepIndicator } from '../BookingStepIndicator';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface StepIndicatorWrapperProps {
  currentStep: BookingStep | number;
  steps: { id: number; key: string; label: string }[];
}

export const StepIndicatorWrapper: React.FC<StepIndicatorWrapperProps> = ({
  currentStep,
  steps
}) => {
  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <BookingStepIndicator 
        currentStep={currentStep} 
      />
    </div>
  );
};
