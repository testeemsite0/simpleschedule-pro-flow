
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';

interface UseInsurancePlansFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string, errorObject?: any) => void;
}

export const useInsurancePlansFetching = ({
  professionalId,
  setIsLoading,
  handleError
}: UseInsurancePlansFetchingProps) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  
  useEffect(() => {
    const fetchInsurancePlans = async () => {
      if (!professionalId) return;
      
      setIsLoading(true);
      
      try {
        console.log("Fetching insurance plans for professional:", professionalId);
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) {
          handleError(`Error loading insurance plans: ${error.message}`, error);
          return;
        }
        
        console.log("Insurance plans fetched successfully:", data?.length || 0);
        setInsurancePlans(data || []);
      } catch (error) {
        handleError(`Error loading insurance plans: ${error}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchInsurancePlans();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { insurancePlans };
};
