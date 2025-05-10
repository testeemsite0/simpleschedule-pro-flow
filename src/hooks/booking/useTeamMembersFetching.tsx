
import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types';
import { fetchTeamMembers } from './api/services/teamMemberService';

interface UseTeamMembersFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const useTeamMembersFetching = ({
  professionalId,
  onSuccess,
  onError,
  enabled = true
}: UseTeamMembersFetchingProps = {}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      console.log("Team members fetching skipped - no professionalId or disabled");
      setIsLoading(false);
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("UseTeamMembersFetching: Starting fetch for professional:", professionalId);
      const result = await fetchTeamMembers(professionalId, signal);
      
      // Ensure we have a valid array of team members
      const typedMembers = Array.isArray(result) ? result : [];
      
      console.log(`UseTeamMembersFetching: Received ${typedMembers.length} team members:`, typedMembers);
      setTeamMembers(typedMembers);
      
      // Call onSuccess callback if provided and we have data
      if (onSuccess) {
        onSuccess();
      }
      
      return typedMembers;
    } catch (err) {
      console.error("UseTeamMembersFetching: Error fetching team members:", err);
      
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, enabled, onSuccess, onError]);
  
  useEffect(() => {
    if (enabled && professionalId) {
      console.log("UseTeamMembersFetching: Initializing team members fetch for professional:", professionalId);
      // Create AbortController for cleanup
      const controller = new AbortController();
      
      fetchData(controller.signal);
      
      // Cleanup function
      return () => {
        controller.abort();
      };
    } else {
      setIsLoading(false);
    }
  }, [professionalId, fetchData, enabled]);
  
  const refetchTeamMembers = useCallback(() => {
    console.log("UseTeamMembersFetching: Manually refetching team members");
    return fetchData();
  }, [fetchData]);
  
  return {
    teamMembers,
    isLoading,
    error,
    fetchTeamMembers: refetchTeamMembers
  };
};
