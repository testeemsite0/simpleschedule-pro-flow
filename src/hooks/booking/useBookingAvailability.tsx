
import { useState, useEffect } from 'react';
import { TeamMember, TimeSlot, Appointment } from '@/types';

interface UseBookingAvailabilityProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  selectedTeamMemberId?: string;
  selectedDate?: Date | null;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingAvailability = ({
  timeSlots,
  appointments,
  selectedTeamMemberId,
  selectedDate
}: UseBookingAvailabilityProps) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Calculate available dates based on time slots
  useEffect(() => {
    if (!timeSlots.length) return;

    // Filter time slots by selected team member if any
    const filteredTimeSlots = selectedTeamMemberId 
      ? timeSlots.filter(slot => !slot.team_member_id || slot.team_member_id === selectedTeamMemberId)
      : timeSlots;

    // Get unique days of week from time slots
    const availableDaysOfWeek = Array.from(
      new Set(filteredTimeSlots.map(slot => slot.day_of_week))
    );

    // Generate dates for the next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const next30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Filter dates that match available days of week
    const filteredDates = next30Days.filter(date => 
      availableDaysOfWeek.includes(date.getDay() === 0 ? 7 : date.getDay())
    );

    setAvailableDates(filteredDates);
  }, [timeSlots, selectedTeamMemberId]);

  // Calculate available time slots for selected date
  useEffect(() => {
    if (!selectedDate || !timeSlots.length) return;

    const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    
    // Filter time slots for the selected day and team member
    const filteredTimeSlots = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      (!selectedTeamMemberId || !slot.team_member_id || slot.team_member_id === selectedTeamMemberId) &&
      slot.available === true
    );

    // Filter out booked appointments
    const dateString = selectedDate.toISOString().split('T')[0];
    const bookedAppointments = appointments.filter(appointment => 
      appointment.date === dateString &&
      appointment.status === 'scheduled' &&
      (!selectedTeamMemberId || !appointment.team_member_id || appointment.team_member_id === selectedTeamMemberId)
    );

    // Generate available slots
    const slots: AvailableSlot[] = [];
    
    filteredTimeSlots.forEach(slot => {
      // Calculate 30-minute increments from start time to end time
      const startHour = parseInt(slot.start_time.split(':')[0], 10);
      const startMinute = parseInt(slot.start_time.split(':')[1], 10);
      const endHour = parseInt(slot.end_time.split(':')[0], 10);
      const endMinute = parseInt(slot.end_time.split(':')[1], 10);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (
        currentHour < endHour || 
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const startTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Calculate end time (30 minutes later)
        let slotEndHour = currentHour;
        let slotEndMinute = currentMinute + 30;
        
        if (slotEndMinute >= 60) {
          slotEndHour += 1;
          slotEndMinute -= 60;
        }
        
        const endTimeString = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
        
        // Check if this slot overlaps with any booked appointment
        const isBooked = bookedAppointments.some(appointment => {
          const apptStart = appointment.start_time;
          const apptEnd = appointment.end_time;
          
          // Check for overlap
          return (
            (startTimeString >= apptStart && startTimeString < apptEnd) ||
            (endTimeString > apptStart && endTimeString <= apptEnd) ||
            (startTimeString <= apptStart && endTimeString >= apptEnd)
          );
        });
        
        if (!isBooked) {
          slots.push({
            date: new Date(selectedDate),
            startTime: startTimeString,
            endTime: endTimeString,
            teamMemberId: slot.team_member_id
          });
        }
        
        // Move to next slot
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute -= 60;
        }
      }
    });
    
    setAvailableSlots(slots);
  }, [selectedDate, timeSlots, appointments, selectedTeamMemberId]);

  return {
    availableDates,
    availableSlots
  };
};
