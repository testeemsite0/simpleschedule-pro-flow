
import React from 'react';
import { BookingStepIndicator } from '../BookingStepIndicator';
import { MaintenanceNotice } from '../MaintenanceNotice';
import { BookingErrorHandler } from '../BookingErrorHandler';
import { LimitWarning } from '../LimitWarning';
import { BookingFormContent } from './BookingFormContent';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingFormContainerProps {
  title?: string;
  showStepIndicator?: boolean;
  isAdminView?: boolean;
  allowWalkIn?: boolean;
  onSuccess?: () => void;
  currentStep: BookingStep;
  error: string | null;
  maintenanceMode: boolean;
  resolvedProfessionalId?: string;
  resetBooking: () => void;
}

export const BookingFormContainer: React.FC<BookingFormContainerProps> = ({
  title,
  showStepIndicator = false,
  isAdminView = false,
  currentStep,
  error,
  maintenanceMode,
  resolvedProfessionalId,
  resetBooking,
  ...props
}) => {
  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      
      {showStepIndicator && (
        <BookingStepIndicator currentStep={currentStep} />
      )}
      
      {maintenanceMode && <MaintenanceNotice />}

      {isAdminView && resolvedProfessionalId && (
        <LimitWarning 
          professionalId={resolvedProfessionalId}
          isAdminView={isAdminView}
        />
      )}

      {error && (
        <BookingErrorHandler 
          error={error} 
          onRetry={resetBooking}
          title="Erro no agendamento"
        />
      )}
      
      <BookingFormContent {...props} />
    </div>
  );
};
