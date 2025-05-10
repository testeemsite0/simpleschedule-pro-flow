
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDataLoadingState } from './useDataLoadingState';
import { useTeamMembersFetching } from './useTeamMembersFetching';
import { useServicesFetching } from './useServicesFetching';
import { useInsurancePlansFetching } from './useInsurancePlansFetching';
import { useTimeSlotsFetching } from './useTimeSlotsFetching';
import { useAppointmentsFetching } from './useAppointmentsFetching';
import { useMaintenanceMode } from './useMaintenanceMode';
import { prewarmBookingDataCache } from './api/dataFetcher'; 

interface UseBookingDataFetchingProps {
  professionalId?: string;
}

export const useBookingDataFetching = ({
  professionalId
}: UseBookingDataFetchingProps = {}) => {
  const { 
    isLoading, 
    setIsLoading, 
    dataError, 
    setDataError, 
    handleError,
    clearError,
    resetRetryCount,
    getCachedData,
    setCachedData,
    cleanup: cleanupLoadingState
  } = useDataLoadingState({ 
    showToast: true,
    maxRetries: 2,
    loadingTimeout: 15000 // 15 seconds timeout, reduced from 45
  });
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Track if this hook has been initialized with the professionalId
  const initializedRef = useRef(false);
  const professionalIdRef = useRef<string | undefined>(undefined);
  const dataFetchingEnabledRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const minFetchIntervalMs = 5000; // 5 seconds minimum between fetches
  
  // Use a ref for tracking the abort controller to prevent infinite renders
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track individual data loading states as refs to prevent unnecessary re-renders
  const loadingStatesRef = useRef({
    teamMembers: false,
    services: false,
    insurancePlans: false,
    timeSlots: false,
    appointments: false
  });
  
  // Create a stable function to update loading states
  const setTypeLoading = useCallback((type: keyof typeof loadingStatesRef.current, loading: boolean) => {
    if (loadingStatesRef.current[type] !== loading) {
      loadingStatesRef.current[type] = loading;
      
      // Check if any type is still loading
      const anyLoading = Object.values(loadingStatesRef.current).some(state => state === true);
      setIsLoading(anyLoading);
    }
  }, [setIsLoading]);
  
  // Sequential loading flag to control loading order
  const [loadingStage, setLoadingStage] = useState<number>(0);
  
  // Initialize data fetching hooks with customized loading setters
  const { teamMembers, fetchTeamMembers } = useTeamMembersFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('teamMembers', loading),
    handleError,
    enabled: loadingStage === 0 // First stage
  });
  
  const { services, fetchServices } = useServicesFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('services', loading),
    handleError,
    enabled: loadingStage === 0 // First stage
  });
  
  const { timeSlots, fetchTimeSlots } = useTimeSlotsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('timeSlots', loading),
    handleError,
    enabled: loadingStage === 1 // Second stage
  });
  
  const { insurancePlans, fetchInsurancePlans } = useInsurancePlansFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('insurancePlans', loading),
    handleError,
    enabled: loadingStage === 1 // Second stage
  });
  
  const { appointments, fetchAppointments } = useAppointmentsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('appointments', loading),
    handleError,
    enabled: loadingStage === 2 // Last stage
  });

  // Progress to next loading stage
  const moveToNextLoadingStage = useCallback(() => {
    setLoadingStage(prev => Math.min(prev + 1, 3)); // Max 3 stages (0-2)
  }, []);

  // Sequential loading logic - first load essential data, then secondary data
  useEffect(() => {
    if (!professionalId || !dataFetchingEnabledRef.current) {
      return;
    }

    // Check if we've fetched data too recently to prevent excessive API calls
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (lastFetchTimeRef.current > 0 && timeSinceLastFetch < minFetchIntervalMs) {
      console.log(`Skipping fetch - last fetch was ${timeSinceLastFetch}ms ago (min interval: ${minFetchIntervalMs}ms)`);
      return;
    }

    const loadData = async () => {
      try {
        // Update the last fetch timestamp
        lastFetchTimeRef.current = now;

        if (loadingStage === 0) {
          // Stage 0: Load essential data in parallel (team members and services)
          await Promise.all([
            fetchTeamMembers(abortControllerRef.current?.signal),
            fetchServices(abortControllerRef.current?.signal)
          ]);
          moveToNextLoadingStage();
        }
        else if (loadingStage === 1) {
          // Stage 1: Load secondary data in parallel
          await Promise.all([
            fetchTimeSlots(abortControllerRef.current?.signal),
            fetchInsurancePlans(abortControllerRef.current?.signal)
          ]);
          moveToNextLoadingStage();
        }
        else if (loadingStage === 2) {
          // Stage 2: Load non-critical data
          await fetchAppointments(abortControllerRef.current?.signal);
          moveToNextLoadingStage();
        }
      } catch (error) {
        console.error(`Error in sequential loading stage ${loadingStage}:`, error);
        
        // Handle "Failed to fetch" errors by attempting to use cached data if available
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.log('Network error detected, attempting to use cached data');
          // Continue to next stage even if there was an error to prevent getting stuck
          moveToNextLoadingStage();
        }
      }
    };

    loadData();
  }, [professionalId, loadingStage, dataFetchingEnabledRef.current, fetchTeamMembers, fetchServices, fetchTimeSlots, fetchInsurancePlans, fetchAppointments, moveToNextLoadingStage]);

  // Only trigger data fetching once per professionalId and prevent unwanted re-initialization
  useEffect(() => {
    // Skip if no professional ID is provided
    if (!professionalId) {
      return;
    }
    
    // If the professional ID changed, reset everything
    if (professionalId !== professionalIdRef.current) {
      console.log("Professional ID changed, resetting state");
      // Update the ref to track the current professionalId
      professionalIdRef.current = professionalId;
      
      // Reset retry counter
      resetRetryCount();
      
      // Clear any previous errors 
      clearError();
      
      // Reset loading stage to start at the beginning
      setLoadingStage(0);
      
      // Reset last fetch time to allow immediate fetching for the new professional
      lastFetchTimeRef.current = 0;
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Enable data fetching
      dataFetchingEnabledRef.current = true;
      
      // Try to pre-warm cache
      prewarmBookingDataCache(professionalId);
      
      // Only log and perform initialization once per professional ID change
      if (!initializedRef.current) {
        console.log("Booking data fetching: Initial data loading for professional ID:", professionalId);
        initializedRef.current = true;
      }
    }
    
  }, [professionalId, clearError, resetRetryCount]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanupLoadingState();
      
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Reset state
      dataFetchingEnabledRef.current = false;
    };
  }, [cleanupLoadingState]);

  // Public interface
  return {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    setMaintenanceMode,
    isLoading,
    dataError,
    setDataError,
    // Add refresh methods to manually trigger data refetching if needed
    refreshTeamMembers: () => fetchTeamMembers(),
    refreshServices: () => fetchServices(),
    refreshTimeSlots: () => fetchTimeSlots(),
    refreshInsurancePlans: () => fetchInsurancePlans(),
    refreshAppointments: () => fetchAppointments()
  };
};
