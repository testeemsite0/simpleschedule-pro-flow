
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
          id: bookingData.teamMemberId || '',
          address: '',
          email: bookingData.professionalEmail || 'email@example.com', // Added email property
          profession: bookingData.professionalRole || 'Profissional', // Added profession property
          slug: bookingData.professionalSlug || 'professional-slug' // Added slug property
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
