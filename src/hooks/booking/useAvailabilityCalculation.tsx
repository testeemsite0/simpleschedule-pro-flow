
import { useMemo, useEffect } from 'react';
import { TimeSlot, Appointment } from '@/types';
import { format, isAfter, isSameDay, parseISO, isBefore, addDays, startOfDay } from 'date-fns';
import { timeToMinutes, minutesToTime, doTimeSlotsOverlap } from '@/components/booking/timeUtils';

interface UseAvailabilityCalculationProps {
  timeSlots?: TimeSlot[];
  appointments?: Appointment[];
  teamMemberId?: string;
  serviceId?: string;
  date?: Date | null;
}

export const useAvailabilityCalculation = ({
  timeSlots = [],
  appointments = [],
  teamMemberId,
  serviceId,
  date
}: UseAvailabilityCalculationProps) => {

  // Log the input data for debugging
  useEffect(() => {
    console.log("useAvailabilityCalculation: Input data", {
      timeSlotsCount: timeSlots?.length || 0,
      appointmentsCount: appointments?.length || 0,
      teamMemberId,
      serviceId,
      selectedDate: date ? date.toISOString().split('T')[0] : null
    });
  }, [timeSlots, appointments, teamMemberId, serviceId, date]);

  // Filter time slots by teamMemberId
  const filteredTimeSlots = useMemo(() => {
    if (!timeSlots || !teamMemberId) return [];
    
    const filtered = timeSlots.filter(
      slot => slot.team_member_id === teamMemberId && slot.available
    );
    
    console.log(`Filtered ${filtered.length} time slots for team member ${teamMemberId}`);
    return filtered;
  }, [timeSlots, teamMemberId]);
  
  // Generate available dates for the next 14 days
  const availableDates = useMemo(() => {
    if (!filteredTimeSlots || filteredTimeSlots.length === 0) return [];
    
    const today = startOfDay(new Date());
    const dates: Date[] = [];
    
    // Look ahead 14 days
    for (let i = 0; i < 14; i++) {
      const checkDate = addDays(today, i);
      const dayOfWeek = checkDate.getDay();
      
      // Check if there's a time slot available for this day of week
      const hasDaySlot = filteredTimeSlots.some(slot => slot.day_of_week === dayOfWeek);
      
      if (hasDaySlot) {
        dates.push(checkDate);
      }
    }
    
    console.log(`Generated ${dates.length} available dates`);
    return dates;
  }, [filteredTimeSlots]);

  // Generate available slots based on the selected date
  const availableSlots = useMemo(() => {
    if (!date || !filteredTimeSlots || filteredTimeSlots.length === 0) return [];
    
    const dayOfWeek = date.getDay();
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get all scheduled appointments for the selected date and team member
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedDate && 
      app.status === 'scheduled' &&
      app.team_member_id === teamMemberId
    );
    
    console.log(`Found ${bookedAppointments.length} booked appointments for ${formattedDate}`);
    
    // Get time slots for the selected day
    const dayTimeSlots = filteredTimeSlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    if (dayTimeSlots.length === 0) {
      console.log(`No time slots defined for day of week ${dayOfWeek}`);
      return [];
    }
    
    // Generate available slots
    const slots: { date: Date; startTime: string; endTime: string; teamMemberId?: string }[] = [];
    const now = new Date();
    
    dayTimeSlots.forEach(slot => {
      // Get slot info
      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Check lunch break
      const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
      
      // Generate slots at interval of appointment duration
      for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
        // Skip lunch break
        if (
          lunchStartMinutes !== null && 
          lunchEndMinutes !== null && 
          ((time < lunchEndMinutes && time + duration > lunchStartMinutes) || 
           (time >= lunchStartMinutes && time < lunchEndMinutes))
        ) {
          continue;
        }
        
        const startTime = minutesToTime(time);
        const endTime = minutesToTime(time + duration);
        
        // Skip if time slot is in the past for today
        if (isSameDay(date, now)) {
          const hours = Math.floor(time / 60);
          const mins = time % 60;
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hours, mins, 0, 0);
          
          if (isBefore(slotDateTime, now)) {
            continue;
          }
        }
        
        // Check if the slot overlaps with any booked appointment
        const isOverlapping = bookedAppointments.some(app => 
          doTimeSlotsOverlap(startTime, endTime, app.start_time, app.end_time)
        );
        
        if (!isOverlapping) {
          slots.push({
            date: new Date(date),
            startTime,
            endTime,
            teamMemberId: slot.team_member_id
          });
        }
      }
    });
    
    // Sort by time
    const sortedSlots = slots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    console.log(`Generated ${sortedSlots.length} available time slots for ${formattedDate}`);
    return sortedSlots;
  }, [date, filteredTimeSlots, appointments, teamMemberId]);

  return {
    availableDates,
    availableSlots,
    selectedDate: date,
    filteredTimeSlots
  };
};
