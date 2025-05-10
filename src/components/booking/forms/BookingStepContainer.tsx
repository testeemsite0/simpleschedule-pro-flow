
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
  currentStep: BookingStep | number;
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
  // Convert number to BookingStep if needed
  const bookingStep = typeof currentStep === 'number' 
    ? (currentStep === 1 ? 'team-member' as BookingStep :
       currentStep === 2 ? 'insurance' as BookingStep :
       currentStep === 3 ? 'service' as BookingStep :
       currentStep === 4 ? 'date' as BookingStep :
       currentStep === 5 ? 'time' as BookingStep : 'team-member' as BookingStep)
    : currentStep;
    
  return (
    <div className="space-y-6">
      {showStepIndicator && (
        <div className="sticky top-0 bg-white z-10 pb-4">
          <BookingStepIndicator
            currentStep={bookingStep}
          />
        </div>
      )}

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
