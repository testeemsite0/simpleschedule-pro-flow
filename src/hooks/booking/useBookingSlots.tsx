
import { useState, useEffect } from 'react';
import { TimeSlot, Appointment } from '@/types';
import { addDays, startOfDay, isBefore } from 'date-fns';

interface UseBookingSlotsProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  selectedTeamMember: string;
  isOverLimit: boolean;
  currentStep: number;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingSlots = ({
  timeSlots,
  appointments,
  selectedTeamMember,
  isOverLimit,
  currentStep
}: UseBookingSlotsProps) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter time slots based on team member selection
  const filteredTimeSlots = timeSlots.filter(slot => 
    !selectedTeamMember || slot.team_member_id === selectedTeamMember
  );
  
  // Generate available dates
  useEffect(() => {
    if (isOverLimit || !selectedTeamMember || currentStep < 4) {
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Skip past dates
      if (isBefore(date, now)) continue;
      
      // Check for available slots on this day
      const hasAvailableSlots = filteredTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      if (hasAvailableSlots) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
    
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [filteredTimeSlots, isOverLimit, selectedDate, selectedTeamMember, currentStep]);
  
  // Generate available time slots
  useEffect(() => {
    if (!selectedDate || isOverLimit || currentStep < 5) {
      setAvailableSlots([]);
      return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    
    // Get all time slots for this day
    const daySlots = filteredTimeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    if (daySlots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Format selected date for appointment filtering
    const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
    
    // Find booked appointments for this date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    // Import function from timeUtils.ts to generate available slots
    const { generateAvailableTimeSlots } = require('../../booking/timeUtils');
    const slots = generateAvailableTimeSlots(daySlots, bookedAppointments, selectedDate);
    
    // Sort by start time
    slots.sort((a: AvailableSlot, b: AvailableSlot) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    setAvailableSlots(slots);
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, currentStep]);

  return {
    availableDates,
    availableSlots,
    selectedDate,
    filteredTimeSlots,
    setSelectedDate
  };
};
