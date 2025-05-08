
import React from 'react';
import { BookingStepIndicator } from '../BookingStepIndicator';

interface StepIndicatorWrapperProps {
  currentStep: number;
  steps: { id: number; label: string }[];
}

export const StepIndicatorWrapper: React.FC<StepIndicatorWrapperProps> = ({
  currentStep,
  steps
}) => {
  return (
    <div className="sticky top-0 bg-white pb-4 z-10">
      <BookingStepIndicator 
        currentStep={currentStep} 
        steps={steps} 
      />
    </div>
  );
};
