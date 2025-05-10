
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

interface UseAppointmentsFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string, errorObject?: any) => void;
}

export const useAppointmentsFetching = ({
  professionalId,
  setIsLoading,
  handleError
}: UseAppointmentsFetchingProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!professionalId) return;
      
      setIsLoading(true);
      
      try {
        console.log("Fetching appointments for professional:", professionalId);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) {
          handleError(`Error loading appointments: ${error.message}`, error);
          return;
        }
        
        console.log("Appointments fetched successfully:", data?.length || 0);
        
        // Type assertion to ensure appointment status is one of the allowed values
        if (data) {
          const typedAppointments = data.map(appointment => {
            // Ensure status is one of the allowed types
            const status = ['scheduled', 'completed', 'canceled'].includes(appointment.status) 
              ? appointment.status as 'scheduled' | 'completed' | 'canceled' 
              : 'scheduled'; // Default to 'scheduled' if invalid status
            
            return {
              ...appointment,
              status
            } as Appointment;
          });
          
          setAppointments(typedAppointments);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        handleError(`Error loading appointments: ${error}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchAppointments();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { appointments };
};
