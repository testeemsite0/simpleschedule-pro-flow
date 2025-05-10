
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';

interface UseServicesFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string, errorObject?: any) => void;
}

export const useServicesFetching = ({
  professionalId,
  setIsLoading,
  handleError
}: UseServicesFetchingProps) => {
  const [services, setServices] = useState<Service[]>([]);
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!professionalId) return;
      
      setIsLoading(true);
      
      try {
        console.log("Fetching services for professional:", professionalId);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (error) {
          handleError(`Error loading services: ${error.message}`, error);
          return;
        }
        
        console.log("Services fetched successfully:", data?.length || 0);
        setServices(data || []);
      } catch (error) {
        handleError(`Error loading services: ${error}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchServices();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { services };
};
