
import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types';
import { fetchTeamMembers } from './api/services/teamMemberService';
import { QueryCache } from './cache/queryCache';

interface UseTeamMembersFetchingProps {
  professionalId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  forceRefresh?: boolean;
}

export const useTeamMembersFetching = ({
  professionalId,
  onSuccess,
  onError,
  enabled = true,
  forceRefresh = false
}: UseTeamMembersFetchingProps = {}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!professionalId || !enabled) {
      console.log(`useTeamMembersFetching: Skipping fetch - professionalId: ${professionalId}, enabled: ${enabled}`);
      setIsLoading(false);
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`useTeamMembersFetching: Starting fetch for professional: ${professionalId}, forceRefresh: ${forceRefresh}`);
      
      // Clear the cache if force refresh is requested
      if (forceRefresh) {
        const cacheKey = `${professionalId}:teamMembers`;
        console.log(`useTeamMembersFetching: Clearing cache for key: ${cacheKey}`);
        QueryCache.delete(cacheKey);
      }
      
      const result = await fetchTeamMembers(professionalId, signal);
      
      // Ensure we have a valid array of team members
      const typedMembers = Array.isArray(result) ? result : [];
      
      console.log(`useTeamMembersFetching: Received ${typedMembers.length} team members:`, typedMembers);
      setTeamMembers(typedMembers);
      
      // Call onSuccess callback if provided and we have data
      if (onSuccess && typedMembers.length > 0) {
        console.log("useTeamMembersFetching: Calling onSuccess callback");
        onSuccess();
      }
      
      return typedMembers;
    } catch (err) {
      console.error("useTeamMembersFetching: Error fetching team members:", err);
      
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      if (onError) {
        console.log("useTeamMembersFetching: Calling onError callback");
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, enabled, forceRefresh, onSuccess, onError]);
  
  useEffect(() => {
    if (enabled && professionalId) {
      console.log(`useTeamMembersFetching: Initializing team members fetch for professional: ${professionalId}`);
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
    console.log("useTeamMembersFetching: Manually refetching team members");
    return fetchData();
  }, [fetchData]);
  
  return {
    teamMembers,
    isLoading,
    error,
    fetchTeamMembers: refetchTeamMembers
  };
};
