
import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types';
import { fetchTeamMembers } from './api/dataFetcher';

interface UseTeamMembersFetchingProps {
  professionalId?: string;
  setIsLoading: (loading: boolean) => void;
  handleError: (context: string, error: any) => void;
  enabled?: boolean;
  onSuccess?: () => void;
}

export const useTeamMembersFetching = ({
  professionalId,
  setIsLoading,
  handleError,
  enabled = true,
  onSuccess
}: UseTeamMembersFetchingProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const result = await fetchTeamMembers(professionalId, signal);
      // Type assertion to ensure we're setting the right type
      const typedMembers = Array.isArray(result) ? result as TeamMember[] : [];
      setTeamMembers(typedMembers);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return typedMembers;
    } catch (error) {
      handleError('team members', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, setIsLoading, handleError, enabled, onSuccess]);
  
  useEffect(() => {
    if (enabled && professionalId) {
      // Create AbortController for cleanup
      const controller = new AbortController();
      
      fetchData(controller.signal);
      
      // Cleanup function
      return () => {
        controller.abort();
      };
    }
  }, [professionalId, fetchData, enabled]);
  
  return {
    teamMembers,
    fetchTeamMembers: fetchData
  };
};
