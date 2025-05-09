
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

// Generate available time slots for a specific date based on template slots and existing appointments
export const generateAvailableTimeSlots = (
  daySlots: TimeSlot[],
  bookedAppointments: Appointment[],
  date: Date
): AvailableSlot[] => {
  const slots: AvailableSlot[] = [];
  const now = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  const currentTimeMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;
  
  console.log(`Generating slots for ${format(date, 'yyyy-MM-dd')} with ${daySlots.length} day slots`);
  
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
      
      // Skip past times for today
      if (isToday && time < currentTimeMinutes) {
        continue;
      }
      
      const startTime = minutesToTime(time);
      const endTime = minutesToTime(time + duration);
      
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
  
  console.log(`Generated ${slots.length} available slots for ${format(date, 'yyyy-MM-dd')}`);
  return slots;
};
