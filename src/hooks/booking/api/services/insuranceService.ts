
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
      .select('id, name, current_appointments, limit_per_plan, professional_id, created_at, updated_at')
      .eq('professional_id', professionalId);
      
    if (error) {
      console.error("InsuranceService: Database error fetching insurance plans:", error);
      throw error;
    }
    
    // Map data to the expected InsurancePlan type
    const insurancePlans = data?.map(plan => ({
      id: plan.id,
      name: plan.name,
      professional_id: plan.professional_id,
      created_at: plan.created_at || new Date().toISOString(),
      updated_at: plan.updated_at || new Date().toISOString(),
      limit_per_plan: plan.limit_per_plan,
      current_appointments: plan.current_appointments
    } as InsurancePlan)) || [];
    
    console.log(`InsuranceService: Successfully fetched ${insurancePlans.length} insurance plans`);
    return { data: insurancePlans, error: null };
  });
