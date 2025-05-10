
import { useState, useEffect, useCallback } from 'react';
import { InsurancePlan } from '@/types';
import { fetchInsurancePlans } from '../api/dataLoader';

export interface UseInsurancePlansFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useInsurancePlansFetching = ({
  professionalId,
  onSuccess,
  onError
}: UseInsurancePlansFetchingProps = {}) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadInsurancePlans = useCallback(async () => {
    if (!professionalId) {
      setInsurancePlans([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const data = await fetchInsurancePlans(professionalId, controller.signal);
      setInsurancePlans(Array.isArray(data) ? data : []);
      
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
    loadInsurancePlans();
  }, [loadInsurancePlans]);
  
  const refetchInsurancePlans = () => {
    loadInsurancePlans();
  };
  
  return {
    insurancePlans,
    isLoading,
    error,
    refetchInsurancePlans
  };
};
