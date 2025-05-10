
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';

interface UseTeamMembersFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (errorMessage: string, errorObject?: any) => void;
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
      
      setIsLoading(true);
      
      try {
        console.log("Fetching team members for professional:", professionalId);
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (error) {
          handleError(`Error loading team members: ${error.message}`, error);
          return;
        }
        
        console.log("Team members fetched successfully:", data?.length || 0);
        setTeamMembers(data || []);
      } catch (error) {
        handleError(`Error loading team members: ${error}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchTeamMembers();
    }
  }, [professionalId, handleError, setIsLoading]);
  
  return { teamMembers };
};
