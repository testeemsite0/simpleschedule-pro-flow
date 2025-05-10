
import { useState, useEffect, useCallback } from 'react';
import { TimeSlot } from '@/types';
import { fetchTimeSlots } from '../api/dataLoader';

export interface UseTimeSlotsFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTimeSlotsFetching = ({
  professionalId,
  onSuccess,
  onError
}: UseTimeSlotsFetchingProps = {}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadTimeSlots = useCallback(async () => {
    if (!professionalId) {
      setTimeSlots([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("useTimeSlotsFetching: Fetching time slots for", professionalId);
      const controller = new AbortController();
      const data = await fetchTimeSlots(professionalId, controller.signal);
      
      // Make sure we have array data
      if (Array.isArray(data)) {
        setTimeSlots(data);
      } else {
        console.warn("useTimeSlotsFetching: Received non-array data:", data);
        setTimeSlots([]);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error("useTimeSlotsFetching: Error fetching time slots:", errorObj);
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, onSuccess, onError]);
  
  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);
  
  const refetchTimeSlots = () => {
    loadTimeSlots();
  };
  
  return {
    timeSlots,
    isLoading,
    error,
    refetchTimeSlots
  };
};
