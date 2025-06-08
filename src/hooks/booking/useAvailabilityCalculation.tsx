
import { useMemo } from 'react';
import { TimeSlot, Appointment } from '@/types';
import { generateAvailableTimeSlots } from '@/components/booking/improved-time-utils';
import { getTodayInTimezone } from '@/utils/dynamicTimezone';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { addDays, format } from 'date-fns';

interface UseAvailabilityCalculationProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  teamMemberId?: string;
  date?: Date | null;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useAvailabilityCalculation = ({
  timeSlots,
  appointments,
  teamMemberId,
  date
}: UseAvailabilityCalculationProps) => {
  const { settings } = useCompanySettings();
  const timezone = settings?.timezone || 'America/Sao_Paulo';
  
  // Calculate available dates (next 30 days from today in company timezone)
  const availableDates = useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) {
      console.log("No time slots available for date calculation");
      return [];
    }

    const today = getTodayInTimezone(timezone);
    const dates: Date[] = [];
    
    // Get unique days of week that have time slots
    const availableDaysOfWeek = [...new Set(
      timeSlots
        .filter(slot => slot.available && (!teamMemberId || slot.team_member_id === teamMemberId))
        .map(slot => slot.day_of_week)
    )];
    
    console.log("Available days of week:", availableDaysOfWeek, "in timezone:", timezone);
    
    // Generate dates for the next 30 days
    for (let i = 0; i < 30; i++) {
      const currentDate = addDays(today, i);
      const dayOfWeek = currentDate.getDay();
      
      // Check if this day of week has available time slots
      if (availableDaysOfWeek.includes(dayOfWeek)) {
        dates.push(currentDate);
      }
    }
    
    console.log(`Generated ${dates.length} available dates in timezone ${timezone}`);
    return dates;
  }, [timeSlots, teamMemberId, timezone]);

  // Calculate available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!date || !timeSlots || timeSlots.length === 0) {
      console.log("No date selected or no time slots available");
      return [];
    }

    const dayOfWeek = date.getDay();
    console.log(`Calculating slots for ${format(date, 'yyyy-MM-dd')}, day of week: ${dayOfWeek} in timezone: ${timezone}`);
    
    // Filter time slots for the selected day and team member
    const daySlots = timeSlots.filter(slot => {
      const matchesDay = slot.day_of_week === dayOfWeek;
      const isAvailable = slot.available;
      const matchesTeamMember = !teamMemberId || slot.team_member_id === teamMemberId;
      
      return matchesDay && isAvailable && matchesTeamMember;
    });
    
    console.log(`Found ${daySlots.length} day slots for ${format(date, 'yyyy-MM-dd')}`);
    
    if (daySlots.length === 0) {
      return [];
    }

    // Filter appointments for the selected date and team member - CRITICAL FIX
    const dateString = format(date, 'yyyy-MM-dd');
    const dayAppointments = appointments.filter(app => {
      const appDateString = format(new Date(app.date), 'yyyy-MM-dd');
      const matchesDate = appDateString === dateString;
      const matchesTeamMember = !teamMemberId || app.team_member_id === teamMemberId;
      const isScheduled = app.status === 'scheduled';
      
      console.log(`Appointment check: ${app.id}, date match: ${matchesDate}, team match: ${matchesTeamMember}, scheduled: ${isScheduled}`);
      
      return matchesDate && matchesTeamMember && isScheduled;
    });
    
    console.log(`Found ${dayAppointments.length} existing appointments for ${dateString}`, dayAppointments.map(a => `${a.start_time}-${a.end_time}`));
    
    // Generate available slots using improved timezone handling with company timezone
    const slots = generateAvailableTimeSlots(daySlots, dayAppointments, date, timezone);
    
    console.log(`Generated ${slots.length} available slots for ${format(date, 'yyyy-MM-dd')} in timezone ${timezone}`);
    console.log('Available slots:', slots.map(s => s.startTime));
    
    return slots;
  }, [timeSlots, appointments, teamMemberId, date, timezone]);

  return {
    availableDates,
    availableSlots
  };
};
