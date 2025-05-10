
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
      console.log("Team members fetching skipped - no professionalId or disabled");
      return [];
    }
    
    setIsLoading(true);
    
    try {
      console.log("Fetching team members for professional:", professionalId);
      const result = await fetchTeamMembers(professionalId, signal);
      
      // Ensure we have a valid array of team members
      const typedMembers = Array.isArray(result) ? result : [];
      
      console.log(`Fetched ${typedMembers.length} team members:`, typedMembers);
      setTeamMembers(typedMembers);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return typedMembers;
    } catch (error) {
      console.error("Error fetching team members:", error);
      handleError('team members', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, setIsLoading, handleError, enabled, onSuccess]);
  
  useEffect(() => {
    if (enabled && professionalId) {
      console.log("Initializing team members fetch for professional:", professionalId);
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
