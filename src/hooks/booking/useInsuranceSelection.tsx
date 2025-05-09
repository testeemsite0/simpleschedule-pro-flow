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
      console.log('Updating available insurance plans based on:', { teamMemberId, plansCount: insurancePlans.length });
      if (teamMemberId) {
        fetchTeamMemberInsurancePlans(teamMemberId);
      } else {
        // When no team member is selected, show all professional's insurance plans
        console.log('No team member selected, showing all insurance plans from professional');
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
      
      if (!memberPlansData || memberPlansData.length === 0) {
        console.log('No specific member plans found, showing all plans');
        setAvailableInsurancePlans([...insurancePlans]);
        return;
      }
      
      updateAvailableInsurancePlans(memberId, memberPlansData, insurancePlans);
    } catch (error) {
      console.error("Error fetching team member insurance plans:", error);
      // If there's an error fetching team member plans, show all insurance plans
      setAvailableInsurancePlans([...insurancePlans]);
    }
  };
  
  const updateAvailableInsurancePlans = (memberId: string, memberPlansData: any[] = [], allPlans: InsurancePlan[] = []) => {
    console.log('Updating available insurance plans with data:', { 
      memberId, 
      memberPlansData, 
      allPlansCount: allPlans.length 
    });
    
    // Important: We only filter plans if we have specific member plans data
    // Otherwise, we show all plans for the professional
    if (!memberPlansData || memberPlansData.length === 0) {
      console.log('No member plan associations found, displaying all plans');
      setAvailableInsurancePlans([...allPlans]);
      return;
    }
    
    // Map of insurance plan IDs associated with this team member
    const memberPlanIds = new Set(memberPlansData.map(plan => plan.insurance_plan_id));
    
    // Prepare list of available insurance plans with availability information
    const availablePlans = allPlans.map(planDetails => {
      // Check if this plan is associated with the team member
      const isAssociatedWithMember = memberPlanIds.has(planDetails.id);
      
      if (!isAssociatedWithMember) {
        console.log(`Plan ${planDetails.id} (${planDetails.name}) is not associated with team member ${memberId}`);
        return null;
      }
      
      const memberPlan = memberPlansData.find(mp => mp.insurance_plan_id === planDetails.id);
      
      // Check if seats are available for this team member and plan
      const isAvailable = !memberPlan.limit_per_member || 
                        memberPlan.current_appointments < memberPlan.limit_per_member;
                    
      // Check if global plan limit is reached
      const isGlobalLimitReached = planDetails.limit_per_plan !== null && 
                                planDetails.current_appointments >= planDetails.limit_per_plan;
      
      console.log(`Plan ${planDetails.name} availability check:`, {
        isAvailable,
        isGlobalLimitReached,
        memberLimit: memberPlan.limit_per_member,
        memberCurrentAppts: memberPlan.current_appointments,
        globalLimit: planDetails.limit_per_plan,
        globalCurrentAppts: planDetails.current_appointments
      });
      
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
    console.log('Insurance plan selection changed to:', value);
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    if (value === "none") {
      setSelectedInsurancePlan(null);
      return;
    }
    
    // Find the selected plan
    const plan = insurancePlans.find(p => p.id === value);
    
    if (!plan) {
      console.error(`Plan with ID ${value} not found`);
      return;
    }
    
    // Check if this plan has a team member specific limit if a team member is selected
    if (teamMemberId) {
      const teamMemberPlan = availableInsurancePlans.find(p => p.id === value);
      
      if (teamMemberPlan) {
        // Check if this plan is available for this team member
        if (!teamMemberPlan.availableForBooking) {
          if (teamMemberPlan.memberLimit && teamMemberPlan.memberCurrentAppointments >= teamMemberPlan.memberLimit) {
            setInsuranceLimitError(`Limite de atendimentos atingido para este profissional com ${plan.name}`);
          } else if (plan.limit_per_plan && plan.current_appointments >= plan.limit_per_plan) {
            setInsuranceLimitError(`Limite global de atendimentos atingido para ${plan.name}`);
          }
          return;
        }
      }
    } else {
      // Check global plan limit when no team member is selected
      if (plan.limit_per_plan && plan.current_appointments >= plan.limit_per_plan) {
        setInsuranceLimitError(`Limite de atendimentos atingido para ${plan.name}`);
        return;
      }
    }
    
    setSelectedInsurancePlan(plan);
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
