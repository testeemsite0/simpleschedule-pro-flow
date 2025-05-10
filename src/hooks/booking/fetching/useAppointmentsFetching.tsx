
import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types';
import { fetchAppointments } from '../api/dataLoader';

export interface UseAppointmentsFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAppointmentsFetching = ({
  professionalId,
  onSuccess,
  onError
}: UseAppointmentsFetchingProps = {}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadAppointments = useCallback(async () => {
    if (!professionalId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const data = await fetchAppointments(professionalId, controller.signal);
      setAppointments(Array.isArray(data) ? data : []);
      
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
    loadAppointments();
  }, [loadAppointments]);
  
  const refetchAppointments = () => {
    loadAppointments();
  };
  
  return {
    appointments,
    isLoading,
    error,
    refetchAppointments
  };
};
