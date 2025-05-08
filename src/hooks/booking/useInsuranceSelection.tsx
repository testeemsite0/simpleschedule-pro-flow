
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
  
  // Fetch all insurance plans for the professional
  useEffect(() => {
    fetchInsurancePlans();
  }, [professionalId]);
  
  // Update available plans when teamMemberId or insurancePlans change
  useEffect(() => {
    if (insurancePlans.length > 0) {
      if (teamMemberId) {
        fetchTeamMemberInsurancePlans(teamMemberId);
      } else {
        // When no team member is selected, show all professional's insurance plans
        setAvailableInsurancePlans([...insurancePlans]);
      }
    }
  }, [teamMemberId, insurancePlans]);
  
  const fetchInsurancePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('professional_id', professionalId);
        
      if (error) throw error;
      
      console.log('Fetched insurance plans:', data);
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
      
      console.log('Fetched team member insurance plans:', memberPlansData);
      updateAvailableInsurancePlans(memberId, memberPlansData || [], insurancePlans);
    } catch (error) {
      console.error("Error fetching team member insurance plans:", error);
      // If there's an error fetching team member plans, show all insurance plans
      setAvailableInsurancePlans([...insurancePlans]);
    }
  };
  
  const updateAvailableInsurancePlans = (memberId: string, memberPlansData: any[] = [], allPlans: InsurancePlan[] = []) => {
    // If no member plans are found, show all insurance plans
    if (memberPlansData.length === 0) {
      console.log('No specific member plans found, showing all plans');
      setAvailableInsurancePlans([...allPlans]);
      return;
    }
    
    // Prepare list of available insurance plans with availability information
    const availablePlans = memberPlansData
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
    
    console.log('Available plans after filtering:', availablePlans);
    setAvailableInsurancePlans(availablePlans);
  };
  
  const handleInsurancePlanChange = (value: string) => {
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    if (value === "none") {
      setSelectedInsurancePlan(null);
      return;
    }
    
    // No need to validate team member for insurance when no team member is required
    if (!teamMemberId && insurancePlans.some(p => p.id === value)) {
      const plan = insurancePlans.find(p => p.id === value);
      setSelectedInsurancePlan(plan || null);
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
