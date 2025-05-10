
import { useState, useEffect, useCallback } from 'react';
import { TimeSlot } from '@/types';
import { fetchTimeSlots } from './api/dataFetcher';

interface UseTimeSlotsFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (context: string, error: any) => void;
  enabled?: boolean;
}

export const useTimeSlotsFetching = ({
  professionalId,
  setIsLoading,
  handleError,
  enabled = true
}: UseTimeSlotsFetchingProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const result = await fetchTimeSlots(professionalId, signal);
      setTimeSlots(result);
      return result;
    } catch (error) {
      handleError('time slots', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, setIsLoading, handleError, enabled]);
  
  useEffect(() => {
    if (enabled && professionalId) {
      // Create AbortController for cleanup
      const controller = new AbortController();
      
      fetchData(controller.signal);
      
      // Cleanup function
      return () => {
        controller.abort();
      };
    }
  }, [professionalId, fetchData, enabled]);
  
  return {
    timeSlots,
    fetchTimeSlots: fetchData
  };
};
