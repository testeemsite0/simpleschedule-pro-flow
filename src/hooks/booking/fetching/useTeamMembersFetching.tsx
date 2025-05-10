
import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types';
import { fetchTeamMembers } from '../api/dataLoader';

export interface UseTeamMembersFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTeamMembersFetching = ({
  professionalId,
  onSuccess,
  onError
}: UseTeamMembersFetchingProps = {}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadTeamMembers = useCallback(async () => {
    if (!professionalId) {
      setTeamMembers([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("useTeamMembersFetching: Loading team members for professional:", professionalId);
      const controller = new AbortController();
      const data = await fetchTeamMembers(professionalId, controller.signal);
      
      // Ensure data is always an array
      const memberArray = Array.isArray(data) ? data : [];
      console.log(`useTeamMembersFetching: Received ${memberArray.length} team members`);
      
      setTeamMembers(memberArray);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("useTeamMembersFetching: Error loading team members:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, onSuccess, onError]);
  
  useEffect(() => {
    console.log("useTeamMembersFetching: Effect triggered with professionalId:", professionalId);
    loadTeamMembers();
  }, [loadTeamMembers]);
  
  const refetchTeamMembers = () => {
    console.log("useTeamMembersFetching: Manually refetching team members");
    loadTeamMembers();
  };
  
  return {
    teamMembers,
    isLoading,
    error,
    refetchTeamMembers
  };
};
