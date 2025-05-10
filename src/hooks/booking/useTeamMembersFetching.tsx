
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';

interface UseTeamMembersFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string) => void;
}

export const useTeamMembersFetching = ({
  professionalId,
  setIsLoading,
  handleError
}: UseTeamMembersFetchingProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!professionalId) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (error) {
          handleError(`Error loading team members: ${error.message}`);
          return;
        }
        
        if (data && data.length === 0) {
          console.warn("No team members found for professional ID:", professionalId);
        } else {
          console.log("Team members loaded:", data);
        }
        
        setTeamMembers(data || []);
      } catch (error) {
        handleError(`Error loading team members: ${error}`);
      }
    };
    
    if (professionalId) {
      fetchTeamMembers();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { teamMembers };
};
