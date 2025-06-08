
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
  
  const { availableDates, availableSlots, calculateAvailableSlots } = useBookingAvailability({
    timeSlots,
    appointments,
    selectedTeamMemberId: teamMemberId,
    selectedDate
  });

  // Fetch booked slots for the selected date
  const fetchBookedSlots = async () => {
    if (!professionalId || !selectedDate || !teamMemberId) {
      setBookedSlots([]);
      return;
    }

    try {
      const formattedDate = getAppointmentDateString(selectedDate);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .eq('team_member_id', teamMemberId)
        .eq('date', formattedDate)
        .eq('status', 'scheduled');

      if (error) {
        console.error('Error fetching booked slots:', error);
        return;
      }

      // Create an array of all booked time ranges
      const booked = data?.map(appointment => appointment.start_time) || [];
      setBookedSlots(booked);
      
    } catch (error) {
      console.error('Error in fetchBookedSlots:', error);
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [professionalId, teamMemberId, selectedDate]);

  // Memoize the result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    availableDates,
    availableSlots,
    selectedDate,
    filteredTimeSlots: timeSlots.filter(slot => 
      slot.professional_id === professionalId &&
      (!teamMemberId || slot.team_member_id === teamMemberId)
    ),
    isLoading,
    bookedSlots,
    refreshSlots: fetchBookedSlots
  }), [availableDates, availableSlots, selectedDate, timeSlots, professionalId, teamMemberId, isLoading, bookedSlots]);

  return result;
};
