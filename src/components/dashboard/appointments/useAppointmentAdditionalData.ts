
import { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useAppointmentAdditionalData = (appointments: Appointment[]) => {
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({});
  const [insurancePlans, setInsurancePlans] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Collect unique IDs to fetch
        const teamMemberIds = Array.from(new Set(
          appointments
            .filter(app => app.team_member_id)
            .map(app => app.team_member_id as string)
        ));
        
        const insurancePlanIds = Array.from(new Set(
          appointments
            .filter(app => app.insurance_plan_id)
            .map(app => app.insurance_plan_id as string)
        ));
        
        // Fetch team members if there are IDs
        if (teamMemberIds.length > 0) {
          const { data: teamMembersData } = await supabase
            .from('team_members')
            .select('id, name')
            .in('id', teamMemberIds);
            
          if (teamMembersData) {
            const membersMap: Record<string, string> = {};
            teamMembersData.forEach(member => {
              membersMap[member.id] = member.name;
            });
            setTeamMembers(membersMap);
          }
        }
        
        // Fetch insurance plans if there are IDs
        if (insurancePlanIds.length > 0) {
          const { data: plansData } = await supabase
            .from('insurance_plans')
            .select('id, name')
            .in('id', insurancePlanIds);
            
          if (plansData) {
            const plansMap: Record<string, string> = {};
            plansData.forEach(plan => {
              plansMap[plan.id] = plan.name;
            });
            setInsurancePlans(plansMap);
          }
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };
    
    if (appointments.length > 0) {
      fetchAdditionalData();
    }
  }, [appointments]);
  
  return { teamMembers, insurancePlans };
};
