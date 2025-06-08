
import { useState, useEffect, useMemo } from 'react';
import { useBookingAvailability } from './useBookingAvailability';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getAppointmentDateString } from '@/utils/timezone';
import { TimeSlot, Appointment } from '@/types';

interface UseBookingSlotsProps {
  professionalId?: string;
  teamMemberId?: string;
  selectedDate?: Date;
  serviceDuration?: number;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
}

export interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingSlots = ({
  professionalId,
  teamMemberId,
  selectedDate,
  serviceDuration = 60,
  timeSlots,
  appointments
}: UseBookingSlotsProps) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { availableDates, availableSlots } = useBookingAvailability({
    timeSlots,
    appointments,
    selectedTeamMemberId: teamMemberId,
    selectedDate
  });

  // Fetch additional booked slots for the selected date (backup check)
  const fetchBookedSlots = async () => {
    if (!professionalId || !selectedDate || !teamMemberId) {
      setBookedSlots([]);
      return;
    }

    try {
      setIsLoading(true);
      const formattedDate = getAppointmentDateString(selectedDate);
      
      console.log(`Fetching booked slots for ${formattedDate}, professional: ${professionalId}, team member: ${teamMemberId}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, end_time, id')
        .eq('professional_id', professionalId)
        .eq('team_member_id', teamMemberId)
        .eq('date', formattedDate)
        .eq('status', 'scheduled');

      if (error) {
        console.error('Error fetching booked slots:', error);
        return;
      }

      console.log('Fetched booked appointments:', data);
      
      // Create an array of all booked time ranges
      const booked = data?.map(appointment => appointment.start_time) || [];
      setBookedSlots(booked);
      
    } catch (error) {
      console.error('Error in fetchBookedSlots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [professionalId, teamMemberId, selectedDate]);

  // Filter out any slots that are in bookedSlots (double protection)
  const filteredAvailableSlots = useMemo(() => {
    if (bookedSlots.length === 0) return availableSlots;
    
    const filtered = availableSlots.filter(slot => !bookedSlots.includes(slot.startTime));
    console.log(`Filtered ${availableSlots.length - filtered.length} booked slots from available slots`);
    return filtered;
  }, [availableSlots, bookedSlots]);

  // Memoize the result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    availableDates,
    availableSlots: filteredAvailableSlots,
    selectedDate,
    filteredTimeSlots: timeSlots.filter(slot => 
      slot.professional_id === professionalId &&
      (!teamMemberId || slot.team_member_id === teamMemberId)
    ),
    isLoading,
    bookedSlots,
    refreshSlots: fetchBookedSlots
  }), [availableDates, filteredAvailableSlots, selectedDate, timeSlots, professionalId, teamMemberId, isLoading, bookedSlots]);

  return result;
};
