
import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/types';
import { fetchServices } from '../api/dataLoader';

export interface UseServicesFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useServicesFetching = ({
  professionalId,
  onSuccess,
  onError
}: UseServicesFetchingProps = {}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadServices = useCallback(async () => {
    if (!professionalId) {
      setServices([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("useServicesFetching: Fetching services for", professionalId);
      const controller = new AbortController();
      const data = await fetchServices(professionalId, controller.signal);
      
      // Make sure we have array data
      if (Array.isArray(data)) {
        setServices(data);
      } else {
        console.warn("useServicesFetching: Received non-array data:", data);
        setServices([]);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error("useServicesFetching: Error fetching services:", errorObj);
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, onSuccess, onError]);
  
  useEffect(() => {
    loadServices();
  }, [loadServices]);
  
  const refetchServices = () => {
    loadServices();
  };
  
  return {
    services,
    isLoading,
    error,
    refetchServices
  };
};
