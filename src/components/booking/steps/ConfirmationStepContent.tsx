
import React from 'react';
import { ConfirmationStep } from './ConfirmationStep';
import { BookingData } from '@/hooks/booking/useBookingSteps';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

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
  // Check if we're in the completed state (has appointmentId)
  if (bookingData.appointmentId) {
    return (
      <BookingConfirmation
        professional={{ 
          name: bookingData.professionalName || 'Profissional', 
          id: '', 
          address: '',
          email: 'email@example.com', // Adding required email property
          profession: 'Profissional', // Adding required profession property
          slug: 'professional-slug' // Adding required slug property
        }}
        clientName={bookingData.clientName || ''}
        date={bookingData.date || new Date()}
        startTime={bookingData.startTime || ''}
        endTime={bookingData.endTime || ''}
        appointmentId={bookingData.appointmentId}
        onClose={() => onConfirm()}
      />
    );
  }

  // Show regular confirmation step if still confirming
  return (
    <ConfirmationStep
      bookingData={bookingData}
      onConfirm={onConfirm}
      onEdit={onEdit}
      isLoading={isLoading}
    />
  );
};
