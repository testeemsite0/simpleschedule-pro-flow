
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
      const controller = new AbortController();
      const data = await fetchTimeSlots(professionalId, controller.signal);
      setTimeSlots(data || []);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
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
