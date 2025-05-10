
import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types';
import { fetchAppointments } from './api/dataFetcher';

interface UseAppointmentsFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (context: string, error: any) => void;
  enabled?: boolean;
}

export const useAppointmentsFetching = ({
  professionalId,
  setIsLoading,
  handleError,
  enabled = true
}: UseAppointmentsFetchingProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const result = await fetchAppointments(professionalId, signal);
      
      // Validate and ensure the status is correctly typed
      const typedAppointments: Appointment[] = Array.isArray(result) ? result.map(app => {
        if (app && typeof app === 'object') {
          // Validate and ensure the status is one of the allowed values
          let status: "scheduled" | "completed" | "canceled" = "scheduled";
          if (app.status === "completed") status = "completed";
          else if (app.status === "canceled") status = "canceled";
          
          return {
            ...(app as object), // Cast to object before spreading to fix spread error
            status
          } as Appointment;
        }
        // Default fallback if entry is not valid
        return {
          id: '',
          professional_id: professionalId,
          client_name: '',
          client_email: '',
          date: '',
          start_time: '',
          end_time: '',
          status: 'scheduled'
        } as Appointment;
      }) : [];
      
      setAppointments(typedAppointments);
      return typedAppointments;
    } catch (error) {
      handleError('appointments', error);
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
    appointments,
    fetchAppointments: fetchData
  };
};
