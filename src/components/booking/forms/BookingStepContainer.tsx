
import React from "react";
import { BookingStepIndicator } from "../BookingStepIndicator";

interface Step {
  id: number;
  label: string;
}

interface BookingStepContainerProps {
  title: string;
  currentStep: number;
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
            steps={steps}
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
