
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types';

interface UseTimeSlotsFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string) => void;
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
      
      try {
        const { data, error } = await supabase
          .from('time_slots')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) {
          handleError(`Error loading time slots: ${error.message}`);
          return;
        }
        
        setTimeSlots(data || []);
      } catch (error) {
        handleError(`Error loading time slots: ${error}`);
      }
    };
    
    if (professionalId) {
      fetchTimeSlots();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { timeSlots };
};
