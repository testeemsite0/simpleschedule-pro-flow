
import React from "react";
import { BookingStepIndicator } from "../BookingStepIndicator";
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface Step {
  id: number;
  key: string;
  label: string;
}

interface BookingStepContainerProps {
  title: string;
  currentStep: BookingStep;
  steps: Step[];
  children: React.ReactNode;
  showStepIndicator?: boolean;
  allowWalkIn?: boolean;
  isAdminView?: boolean;
  onWalkIn?: () => void;
}

export const BookingStepContainer: React.FC<BookingStepContainerProps> = ({
  title,
  currentStep,
  steps,
  children,
  showStepIndicator = true,
  allowWalkIn = false,
  isAdminView = false,
  onWalkIn
}) => {
  return (
    <div className="space-y-6">
      {showStepIndicator && (
        <div className="sticky top-0 bg-white z-10 pb-4">
          <BookingStepIndicator
            currentStep={currentStep}
          />
        </div>
      )}

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
