
import { useState, useEffect } from 'react';
import { format, isSameDay, addDays, startOfDay, isBefore } from 'date-fns';
import { generateAvailableTimeSlots } from '@/booking/timeUtils';
import { TimeSlot, Appointment } from '@/types';

interface UseAvailabilityCalculationProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  teamMemberId: string | undefined;
  date: Date | undefined;
}

export const useAvailabilityCalculation = ({
  timeSlots,
  appointments,
  teamMemberId,
  date
}: UseAvailabilityCalculationProps) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Calculate availability when professional, team member or time slots change
  useEffect(() => {
    // Only calculate if we have a team member selected and time slots
    if (!teamMemberId || timeSlots.length === 0) {
      console.log("No team member or time slots, clearing availableDates");
      setAvailableDates([]);
      return;
    }

    console.log("Calculating available dates with team member:", teamMemberId);
    
    const now = startOfDay(new Date());
    const dates: Date[] = [];
    
    // Filter time slots for the selected team member
    const teamMemberTimeSlots = timeSlots.filter(slot => 
      slot.team_member_id === teamMemberId && 
      slot.available === true
    );
    
    console.log(`Found ${teamMemberTimeSlots.length} time slots for team member`);
    
    if (teamMemberTimeSlots.length === 0) {
      console.log("No time slots found for team member, clearing availableDates");
      setAvailableDates([]);
      return;
    }
    
    // Get unique days of week with available slots
    const availableDaysOfWeek = Array.from(
      new Set(teamMemberTimeSlots.map(slot => slot.day_of_week))
    );
    
    console.log("Available days of week:", availableDaysOfWeek);
    
    // Generate next 14 days
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday (0) to 7 for our system
      
      // Skip past dates
      if (isBefore(date, now) && !isSameDay(date, now)) {
        continue;
      }
      
      // Skip days without slots
      if (!availableDaysOfWeek.includes(dayOfWeek)) {
        continue;
      }
      
      // Format selected date for filtering appointments
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Find bookings for this date and this team member
      const bookedAppointments = appointments.filter(app => 
        app.date === formattedDate && 
        app.status === 'scheduled' &&
        app.team_member_id === teamMemberId
      );
      
      // Get all slots for this day
      const daySlots = teamMemberTimeSlots.filter(slot => slot.day_of_week === dayOfWeek);
      
      if (daySlots.length > 0) {
        try {
          // Calculate available slots for this day
          const availableTimeSlots = generateAvailableTimeSlots(daySlots, bookedAppointments, date);
          
          // Add date if there are available slots
          if (availableTimeSlots.length > 0) {
            dates.push(date);
            console.log(`Date ${formattedDate} has ${availableTimeSlots.length} available slots`);
          } else {
            console.log(`Date ${formattedDate} has no available slots`);
          }
        } catch (error) {
          console.error("Error calculating available slots:", error);
        }
      }
    }
    
    console.log(`Found ${dates.length} available dates`);
    setAvailableDates(dates);
  }, [teamMemberId, timeSlots, appointments]);

  // Update available slots when date is selected
  useEffect(() => {
    if (!date || !teamMemberId) {
      setAvailableSlots([]);
      return;
    }
    
    console.log("Calculating available slots for date:", date);
    
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    
    // Filter time slots for selected team member and day of week
    const teamMemberTimeSlots = timeSlots.filter(slot => 
      slot.team_member_id === teamMemberId &&
      slot.day_of_week === dayOfWeek &&
      slot.available === true
    );
    
    if (teamMemberTimeSlots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Format the selected date for filtering appointments
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Find bookings for this date and team member
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedDate && 
      app.status === 'scheduled' &&
      app.team_member_id === teamMemberId
    );
    
    try {
      // Generate available time slots
      const slots = generateAvailableTimeSlots(teamMemberTimeSlots, bookedAppointments, date);
      
      console.log(`Generated ${slots.length} available time slots`);
      
      // Add team member ID to each slot
      const slotsWithTeamMember = slots.map(slot => ({
        ...slot,
        teamMemberId: teamMemberId
      }));
      
      setAvailableSlots(slotsWithTeamMember);
    } catch (error) {
      console.error("Error generating available time slots:", error);
      setAvailableSlots([]);
    }
  }, [date, teamMemberId, timeSlots, appointments]);

  return {
    availableDates,
    availableSlots
  };
};
