
import { useState, useEffect, useMemo } from 'react';
import { useBookingAvailability } from './useBookingAvailability';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getAppointmentDateString } from '@/utils/timezone';

interface UseBookingSlotsProps {
  professionalId?: string;
  teamMemberId?: string;
  selectedDate?: Date;
  serviceDuration?: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export const useBookingSlots = ({
  professionalId,
  teamMemberId,
  selectedDate,
  serviceDuration = 60
}: UseBookingSlotsProps) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const { calculateAvailableSlots } = useBookingAvailability();

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

  useEffect(() => {
    const generateSlots = async () => {
      if (!professionalId || !teamMemberId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('Generating slots for:', {
          professionalId,
          teamMemberId,
          selectedDate: selectedDate.toISOString(),
          serviceDuration,
          bookedSlots
        });

        const slots = await calculateAvailableSlots({
          professionalId,
          teamMemberId,
          date: selectedDate,
          serviceDuration
        });

        console.log('Raw calculated slots:', slots);

        // Filter out booked slots
        const filteredSlots = slots.filter(slot => {
          const isBooked = bookedSlots.includes(slot.start);
          console.log(`Slot ${slot.start}: ${isBooked ? 'BOOKED' : 'AVAILABLE'}`);
          return !isBooked;
        });

        console.log('Filtered available slots:', filteredSlots);
        
        setAvailableSlots(filteredSlots);
      } catch (error) {
        console.error('Error generating slots:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    generateSlots();
  }, [professionalId, teamMemberId, selectedDate, serviceDuration, bookedSlots, calculateAvailableSlots]);

  // Memoize the result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    availableSlots,
    isLoading,
    bookedSlots,
    refreshSlots: fetchBookedSlots
  }), [availableSlots, isLoading, bookedSlots]);

  return result;
};
