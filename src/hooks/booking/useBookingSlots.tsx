
import { useState, useEffect } from 'react';
import { TimeSlot, Appointment } from '@/types';
import { addDays, startOfDay, isBefore, format } from 'date-fns';
// Import timeUtils properly instead of using require
import { generateAvailableTimeSlots } from '../../booking/timeUtils';

interface UseBookingSlotsProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  selectedTeamMember: string;
  selectedService: string;
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
  selectedService,
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
  
  // Generate available dates - REMOVED selectedDate from dependency array to prevent infinite loop
  useEffect(() => {
    // Only check for teamMember, not service
    if (isOverLimit || !selectedTeamMember) {
      console.log("Not generating dates due to:", { isOverLimit, selectedTeamMember, currentStep });
      setAvailableDates([]);
      return;
    }
    
    console.log("Generating available dates with:", { 
      selectedTeamMember, 
      selectedService, 
      currentStep,
      timeSlotsCount: filteredTimeSlots.length 
    });
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    // Cache for avoiding recalculating slots for the same day multiple times
    const dateSlotCache: Record<string, AvailableSlot[]> = {};
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Skip past dates
      if (isBefore(date, now)) continue;
      
      // Check if there are available time slots on this day
      const hasAvailableTimeSlots = filteredTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      if (hasAvailableTimeSlots) {
        // Format selected date for filtering appointments
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Find bookings for this date
        const bookedAppointments = appointments.filter(app => 
          app.date === formattedDate && app.status === 'scheduled'
        );
        
        // Get all slots for this day
        const daySlots = filteredTimeSlots.filter(
          slot => slot.day_of_week === dayOfWeek && slot.available
        );
        
        if (daySlots.length > 0) {
          try {
            // If we've already calculated slots for this date+team member, use the cache
            const cacheKey = `${formattedDate}_${selectedTeamMember}`;
            
            if (!dateSlotCache[cacheKey]) {
              // Use the proper import instead of require
              dateSlotCache[cacheKey] = generateAvailableTimeSlots(daySlots, bookedAppointments, date);
            }
            
            const availableTimeSlots = dateSlotCache[cacheKey];
            
            // Add the date if there are available slots or if we're not checking slots yet
            if (availableTimeSlots && availableTimeSlots.length > 0) {
              dates.push(date);
              console.log(`Date ${formattedDate} has ${availableTimeSlots.length} available slots`);
            } else {
              console.log(`Date ${formattedDate} has no available slots`);
            }
          } catch (error) {
            console.error("Error generating available time slots:", error);
          }
        }
      }
    }
    
    console.log("Available dates generated:", dates.length);
    setAvailableDates(dates);
    
    // Initialize selectedDate if needed but prevent loops
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    } else if (dates.length === 0) {
      setSelectedDate(null);
    }
  }, [filteredTimeSlots, appointments, isOverLimit, selectedTeamMember, currentStep]); // Removed selectedDate
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate || isOverLimit || currentStep < 5) {
      setAvailableSlots([]);
      return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    
    // Get all slots for this day
    const daySlots = filteredTimeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    if (daySlots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Format the selected date for filtering appointments
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Find bookings for this date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    try {
      // Use the imported function from timeUtils.ts
      const slots = generateAvailableTimeSlots(daySlots, bookedAppointments, selectedDate);
      
      if (slots && slots.length > 0) {
        // Sort by start time
        slots.sort((a: AvailableSlot, b: AvailableSlot) => {
          const timeA = a.startTime.split(':').map(Number);
          const timeB = b.startTime.split(':').map(Number);
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
        
        setAvailableSlots(slots);
        console.log(`${slots.length} slots available for date ${formattedSelectedDate}`);
      } else {
        console.log(`No slots available for date ${formattedSelectedDate}`);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error generating available time slots:", error);
      setAvailableSlots([]);
    }
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, currentStep, selectedTeamMember]);

  return {
    availableDates,
    availableSlots,
    selectedDate,
    filteredTimeSlots,
    setSelectedDate
  };
};
