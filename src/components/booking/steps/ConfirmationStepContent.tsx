
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
          email: bookingData.professionalEmail || 'email@example.com',
          profession: bookingData.professionalRole || 'Profissional',
          slug: bookingData.professionalSlug || 'professional-slug'
        }}
        clientName={bookingData.clientName || ''}
        date={bookingData.date || new Date()}
        startTime={bookingData.startTime || ''}
        endTime={bookingData.endTime || ''}
        appointmentId={bookingData.appointmentId}
        onClose={() => {
          // Reset the booking data and go back to start
          console.log("BookingConfirmation: Closing and resetting booking");
          onConfirm(); // This should reset and go to first step
        }}
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
