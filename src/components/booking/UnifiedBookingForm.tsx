
import React from 'react';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { BookingFormContainer } from './containers/BookingFormContainer';

interface UnifiedBookingFormProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
  allowWalkIn?: boolean;
  onSuccess?: () => void;
}

export const UnifiedBookingForm: React.FC<UnifiedBookingFormProps> = ({
  title,
  showStepIndicator = false,
  isAdminView = false,
  allowWalkIn = false,
  onSuccess
}) => {
  const { 
    currentStep, 
    error,
    maintenanceMode,
    resetBooking,
    resolvedProfessionalId
  } = useUnifiedBooking();

  return (
    <BookingFormContainer
      title={title}
      showStepIndicator={showStepIndicator}
      isAdminView={isAdminView}
      allowWalkIn={allowWalkIn}
      onSuccess={onSuccess}
      currentStep={currentStep}
      error={error}
      maintenanceMode={maintenanceMode}
      resolvedProfessionalId={resolvedProfessionalId}
      resetBooking={resetBooking}
    />
  );
};
