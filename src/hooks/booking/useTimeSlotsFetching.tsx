
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types';

interface UseTimeSlotsFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string, errorObject?: any) => void;
}

export const useTimeSlotsFetching = ({
  professionalId,
  setIsLoading,
  handleError
}: UseTimeSlotsFetchingProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!professionalId) return;
      
      setIsLoading(true);
      
      try {
        console.log("Fetching time slots for professional:", professionalId);
        const { data, error } = await supabase
          .from('time_slots')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) {
          handleError(`Error loading time slots: ${error.message}`, error);
          return;
        }
        
        console.log("Time slots fetched successfully:", data?.length || 0);
        setTimeSlots(data || []);
      } catch (error) {
        handleError(`Error loading time slots: ${error}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchTimeSlots();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { timeSlots };
};
