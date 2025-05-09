
import React from 'react';
import BookingForm from '@/components/booking/BookingForm';
import { Professional } from '@/types';

interface BookingFormSectionProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
}

export const BookingFormSection: React.FC<BookingFormSectionProps> = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  selectedTeamMember,
  onSuccess,
  onCancel
}) => {
  return (
    <BookingForm 
      professional={professional}
      selectedDate={selectedDate}
      startTime={startTime}
      endTime={endTime}
      selectedTeamMember={selectedTeamMember}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};
