
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
      console.log("useInsurancePlansFetching: Fetching insurance plans for", professionalId);
      const controller = new AbortController();
      const data = await fetchInsurancePlans(professionalId, controller.signal);
      
      // Make sure we have array data
      if (Array.isArray(data)) {
        setInsurancePlans(data);
      } else {
        console.warn("useInsurancePlansFetching: Received non-array data:", data);
        setInsurancePlans([]);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error("useInsurancePlansFetching: Error fetching insurance plans:", errorObj);
      setError(errorObj);
      if (onError) {
        onError(errorObj);
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
