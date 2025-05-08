
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan, TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseInsuranceSelectionProps {
  professionalId: string;
  teamMemberId?: string;
}

export const useInsuranceSelection = ({ professionalId, teamMemberId }: UseInsuranceSelectionProps) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState<InsurancePlan[]>([]);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState<InsurancePlan | null>(null);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchInsurancePlans();
  }, [professionalId]);
  
  useEffect(() => {
    if (teamMemberId && insurancePlans.length > 0) {
      fetchTeamMemberInsurancePlans(teamMemberId);
    }
  }, [teamMemberId, insurancePlans]);
  
  const fetchInsurancePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('professional_id', professionalId);
        
      if (error) throw error;
      
      setInsurancePlans(data || []);
    } catch (error) {
      console.error("Error fetching insurance plans:", error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os convênios',
        variant: 'destructive',
      });
    }
  };
  
  const fetchTeamMemberInsurancePlans = async (memberId: string) => {
    try {
      const { data: memberPlansData, error: planError } = await supabase
        .from('team_member_insurance_plans')
        .select(`
          id,
          team_member_id,
          insurance_plan_id,
          limit_per_member,
          current_appointments
        `)
        .eq('team_member_id', memberId);
        
      if (planError) throw planError;
      
      updateAvailableInsurancePlans(memberId, memberPlansData || [], insurancePlans);
    } catch (error) {
      console.error("Error fetching team member insurance plans:", error);
      setAvailableInsurancePlans([]);
    }
  };
  
  const updateAvailableInsurancePlans = (memberId: string, memberPlansData: any[] = [], allPlans: InsurancePlan[] = []) => {
    // Find all insurance plans available for this professional
    const memberPlans = memberPlansData.filter(
      plan => plan.team_member_id === memberId
    );
    
    if (memberPlans.length === 0) {
      setAvailableInsurancePlans([]);
      return;
    }
    
    // Prepare list of available insurance plans with availability information
    const availablePlans = memberPlans
      .map(memberPlan => {
        const planDetails = allPlans.find(p => p.id === memberPlan.insurance_plan_id);
        
        if (!planDetails) return null;
        
        // Check if seats are available for this professional and plan
        const isAvailable = memberPlan.limit_per_member === null || 
                          memberPlan.current_appointments < memberPlan.limit_per_member;
                    
        // Check if global plan limit is reached
        const isGlobalLimitReached = planDetails.limit_per_plan !== null && 
                                  planDetails.current_appointments >= planDetails.limit_per_plan;
        
        // Return an extended version of the plan with additional information
        return {
          ...planDetails,
          availableForBooking: isAvailable && !isGlobalLimitReached,
          memberPlanId: memberPlan.id,
          memberLimit: memberPlan.limit_per_member,
          memberCurrentAppointments: memberPlan.current_appointments
        } as InsurancePlan;
      })
      .filter((plan): plan is InsurancePlan => plan !== null);
    
    setAvailableInsurancePlans(availablePlans);
  };
  
  const handleInsurancePlanChange = (value: string) => {
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    if (value === "none") {
      setSelectedInsurancePlan(null);
      return;
    }
    
    if (!teamMemberId) {
      setInsuranceLimitError("Você deve selecionar um profissional primeiro");
      return;
    }
    
    const plan = insurancePlans.find(p => p.id === value);
    setSelectedInsurancePlan(plan || null);
  };
  
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  
  return {
    insurancePlans,
    availableInsurancePlans,
    insurancePlanId,
    selectedInsurancePlan,
    insuranceLimitError,
    setInsurancePlanId,
    handleInsurancePlanChange
  };
};
