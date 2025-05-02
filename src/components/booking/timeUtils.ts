
// Helper functions for time calculations
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Format time for display (returns in HH:mm format)
export const formatTimeDisplay = (time: string): string => {
  if (!time) return '';
  return time.substring(0, 5); // Ensure we only show HH:MM format
};

// Check if two time slots overlap
export const doTimeSlotsOverlap = (
  startTime1: string, 
  endTime1: string, 
  startTime2: string, 
  endTime2: string
): boolean => {
  const start1 = timeToMinutes(startTime1);
  const end1 = timeToMinutes(endTime1);
  const start2 = timeToMinutes(startTime2);
  const end2 = timeToMinutes(endTime2);
  
  return (start1 < end2 && end1 > start2);
};

// Generate a set of available time slots, filtering out any booked slots
export const generateAvailableTimeSlots = (
  daySlots: any[], 
  bookedAppointments: any[],
  appointmentDate: Date
) => {
  const slots = [];
  
  daySlots.forEach(slot => {
    // Get start and end times in minutes
    const startMinutes = timeToMinutes(slot.start_time);
    const endMinutes = timeToMinutes(slot.end_time);
    
    // Get lunch break times in minutes (if applicable)
    const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
    const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
    
    // Get appointment duration (default to 60 minutes if not specified)
    const duration = slot.appointment_duration_minutes || 60;
    
    // Generate possible appointment start times
    for (let time = startMinutes; time <= endMinutes - duration; time += duration) {
      const endTime = time + duration;
      const startTimeStr = minutesToTime(time);
      const endTimeStr = minutesToTime(endTime);
      
      // Skip if appointment overlaps with lunch break
      if (
        lunchStartMinutes !== null && 
        lunchEndMinutes !== null && 
        ((time < lunchEndMinutes && endTime > lunchStartMinutes) || 
         (time >= lunchStartMinutes && time < lunchEndMinutes))
      ) {
        continue;
      }
      
      // Check if this slot overlaps with any booked appointment
      const isOverlapping = bookedAppointments.some(app => {
        const appStartMinutes = timeToMinutes(app.start_time);
        const appEndMinutes = timeToMinutes(app.end_time);
        
        // Check for overlap
        return (time < appEndMinutes && endTime > appStartMinutes);
      });
      
      if (!isOverlapping) {
        slots.push({
          date: appointmentDate,
          startTime: startTimeStr,
          endTime: endTimeStr
        });
      }
    }
  });
  
  return slots;
};
