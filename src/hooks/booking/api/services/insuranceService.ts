
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch insurance plans - medium priority
 */
export const fetchInsurancePlans = (professionalId: string, signal?: AbortSignal) => 
  fetchData<InsurancePlan>({
    type: 'insurancePlans',
    professionalId,
    signal,
    priority: 'medium',
    ttl: 60 * 10 * 1.5 // Cache insurance plans for longer (15 min)
  }, async () => {
    console.log("InsuranceService: Executing DB query for professional:", professionalId);
    
    const { data, error } = await supabase
      .from('insurance_plans')
      .select('id, name, current_appointments, limit_per_plan')
      .eq('professional_id', professionalId);
      
    if (error) {
      console.error("InsuranceService: Database error fetching insurance plans:", error);
      throw error;
    }
    
    console.log(`InsuranceService: Successfully fetched ${data?.length || 0} insurance plans`);
    return { data: data || [], error: null };
  });
