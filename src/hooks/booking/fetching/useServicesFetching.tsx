
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
      const controller = new AbortController();
      const data = await fetchServices(professionalId, controller.signal);
      setServices(Array.isArray(data) ? data : []);
      
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
