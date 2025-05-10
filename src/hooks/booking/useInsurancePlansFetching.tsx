
import { useState, useEffect, useCallback } from 'react';
import { InsurancePlan } from '@/types';
import { fetchInsurancePlans } from './api/dataFetcher';

interface UseInsurancePlansFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (context: string, error: any) => void;
  enabled?: boolean;
}

export const useInsurancePlansFetching = ({
  professionalId,
  setIsLoading,
  handleError,
  enabled = true
}: UseInsurancePlansFetchingProps) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const result = await fetchInsurancePlans(professionalId, signal);
      setInsurancePlans(result);
      return result;
    } catch (error) {
      handleError('insurance plans', error);
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
    insurancePlans,
    fetchInsurancePlans: fetchData
  };
};
