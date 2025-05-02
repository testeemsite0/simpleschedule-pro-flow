
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
