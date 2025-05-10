
import React from 'react';
import { ConfirmationStep } from '../steps/ConfirmationStep';
import { BookingData } from '@/hooks/booking/useBookingSteps';

interface ConfirmationStepContentProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading: boolean;
}

export const ConfirmationStepContent: React.FC<ConfirmationStepContentProps> = ({
  bookingData,
  onConfirm,
  onEdit,
  isLoading
}) => {
  return (
    <ConfirmationStep
      bookingData={bookingData}
      onConfirm={onConfirm}
      onEdit={onEdit}
      isLoading={isLoading}
    />
  );
};
