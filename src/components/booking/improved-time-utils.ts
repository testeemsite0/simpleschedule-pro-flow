
import { isSlotInPastInTimezone, isTodayInTimezone } from '@/utils/dynamicTimezone';
import { TimeSlot, Appointment } from '@/types';
import { format } from 'date-fns';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

// Convert time string (HH:MM) to minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from midnight to time string (HH:MM)
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Check if two time slots overlap
export const doTimeSlotsOverlap = (
  startA: string, 
  endA: string, 
  startB: string, 
  endB: string
): boolean => {
  const startAMinutes = timeToMinutes(startA);
  const endAMinutes = timeToMinutes(endA);
  const startBMinutes = timeToMinutes(startB);
  const endBMinutes = timeToMinutes(endB);
  
  return (startAMinutes < endBMinutes && endAMinutes > startBMinutes);
};

// Generate available time slots with proper timezone handling
export const generateAvailableTimeSlots = (
  daySlots: TimeSlot[],
  bookedAppointments: Appointment[],
  date: Date,
  timezone: string = 'America/Sao_Paulo'
): AvailableSlot[] => {
  const slots: AvailableSlot[] = [];
  const isToday = isTodayInTimezone(date, timezone);
  
  console.log(`Generating slots for ${format(date, 'yyyy-MM-dd')} with ${daySlots.length} day slots in timezone ${timezone}`);
  console.log(`Is today: ${isToday}`);
  
  daySlots.forEach(slot => {
    // Convert times to minutes for easier calculation
    const startMinutes = timeToMinutes(slot.start_time);
    const endMinutes = timeToMinutes(slot.end_time);
    const duration = slot.appointment_duration_minutes || 60;
    
    // Handle lunch breaks if present
    const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
    const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
    
    // Generate slots
    for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
      // Skip slots that overlap with lunch break
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
      
      // Skip past times using proper timezone handling
      if (isSlotInPastInTimezone(date, startTime, timezone)) {
        console.log(`Skipping past slot: ${startTime} on ${format(date, 'yyyy-MM-dd')} in timezone ${timezone}`);
        continue;
      }
      
      // Check if the slot is already booked
      const isOverlapping = bookedAppointments.some(app => {
        return doTimeSlotsOverlap(
          startTime, 
          endTime, 
          app.start_time, 
          app.end_time
        );
      });
      
      // Only add if not booked
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
  
  console.log(`Generated ${slots.length} available slots for ${format(date, 'yyyy-MM-dd')} in timezone ${timezone}`);
  return slots;
};

// Filter out past slots with timezone awareness
export const filterPastSlots = (slots: AvailableSlot[], timezone: string = 'America/Sao_Paulo'): AvailableSlot[] => {
  return slots.filter(slot => !isSlotInPastInTimezone(slot.date, slot.startTime, timezone));
};
