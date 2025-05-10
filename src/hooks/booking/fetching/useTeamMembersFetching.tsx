
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
      const controller = new AbortController();
      const data = await fetchTeamMembers(professionalId, controller.signal);
      setTeamMembers(data || []);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, onSuccess, onError]);
  
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);
  
  const refetchTeamMembers = () => {
    loadTeamMembers();
  };
  
  return {
    teamMembers,
    isLoading,
    error,
    refetchTeamMembers
  };
};
