
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
      console.log("useAppointmentsFetching: Fetching appointments for", professionalId);
      const controller = new AbortController();
      const data = await fetchAppointments(professionalId, controller.signal);
      
      // Make sure we have array data
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        console.warn("useAppointmentsFetching: Received non-array data:", data);
        setAppointments([]);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error("useAppointmentsFetching: Error fetching appointments:", errorObj);
      setError(errorObj);
      if (onError) {
        onError(errorObj);
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
