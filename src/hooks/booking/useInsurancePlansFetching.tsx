
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';

interface UseInsurancePlansFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string) => void;
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
      
      try {
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) {
          handleError(`Error loading insurance plans: ${error.message}`);
          return;
        }
        
        setInsurancePlans(data || []);
      } catch (error) {
        handleError(`Error loading insurance plans: ${error}`);
      }
    };
    
    if (professionalId) {
      fetchInsurancePlans();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { insurancePlans };
};
