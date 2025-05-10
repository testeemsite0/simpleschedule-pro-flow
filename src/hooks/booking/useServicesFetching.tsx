
import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/types';
import { fetchServices } from './api/dataFetcher';

interface UseServicesFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (context: string, error: any) => void;
  enabled?: boolean;
}

export const useServicesFetching = ({
  professionalId,
  setIsLoading,
  handleError,
  enabled = true
}: UseServicesFetchingProps) => {
  const [services, setServices] = useState<Service[]>([]);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const result = await fetchServices(professionalId, signal);
      // Type assertion to ensure we're setting the right type
      const typedServices = Array.isArray(result) ? result as Service[] : [];
      setServices(typedServices);
      return typedServices;
    } catch (error) {
      handleError('services', error);
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
    services,
    fetchServices: fetchData
  };
};
