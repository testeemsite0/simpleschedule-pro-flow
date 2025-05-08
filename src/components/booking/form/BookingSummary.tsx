
import React from 'react';
import { BookingAppointmentSummary } from '../BookingAppointmentSummary';
import { TeamMember } from '@/types';

interface BookingSummaryProps {
  professionalName: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: TeamMember;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  professionalName,
  selectedDate,
  startTime,
  endTime,
  selectedTeamMember,
}) => {
  return (
    <BookingAppointmentSummary 
      professionalName={professionalName}
      selectedDate={selectedDate}
      startTime={startTime}
      endTime={endTime}
      selectedTeamMember={selectedTeamMember}
    />
  );
};
