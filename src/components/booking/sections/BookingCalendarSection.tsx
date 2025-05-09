
import React from 'react';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { Professional } from '@/types';
import { useBooking } from '@/context/BookingContext';

interface BookingCalendarSectionProps {
  professional: Professional;
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
}

export const BookingCalendarSection: React.FC<BookingCalendarSectionProps> = ({ 
  professional, 
  onSelectSlot 
}) => {
  const { timeSlots, appointments } = useBooking();

  return (
    <BookingCalendar 
      professional={professional}
      timeSlots={timeSlots}
      appointments={appointments}
      onSelectSlot={onSelectSlot}
    />
  );
};
