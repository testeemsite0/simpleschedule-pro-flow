
import React from 'react';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { Professional } from '@/types';
import { useBooking } from '@/context/BookingContext';

interface BookingConfirmationSectionProps {
  professional: Professional;
  onClose: () => void;
}

export const BookingConfirmationSection: React.FC<BookingConfirmationSectionProps> = ({
  professional,
  onClose
}) => {
  const { 
    clientName, 
    selectedDate, 
    selectedStartTime, 
    selectedEndTime, 
    appointmentId 
  } = useBooking();
  
  // Make sure we have all required data before rendering
  if (!selectedDate) {
    return null;
  }

  return (
    <BookingConfirmation
      professional={professional}
      clientName={clientName}
      date={selectedDate}
      startTime={selectedStartTime}
      endTime={selectedEndTime}
      appointmentId={appointmentId}
      onClose={onClose}
    />
  );
};
