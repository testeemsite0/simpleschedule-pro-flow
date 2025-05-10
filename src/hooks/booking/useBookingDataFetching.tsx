
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDataLoadingState } from './useDataLoadingState';
import { useTeamMembersFetching } from './useTeamMembersFetching';
import { useServicesFetching } from './useServicesFetching';
import { useInsurancePlansFetching } from './useInsurancePlansFetching';
import { useTimeSlotsFetching } from './useTimeSlotsFetching';
import { useAppointmentsFetching } from './useAppointmentsFetching';
import { useMaintenanceMode } from './useMaintenanceMode';

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
    maxRetries: 3,
    loadingTimeout: 45000 // 45 seconds timeout
  });
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Track if this hook has been initialized with the professionalId
  const initializedRef = useRef(false);
  const professionalIdRef = useRef<string | undefined>(undefined);
  const dataFetchingEnabledRef = useRef(false);
  
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
  
  // Initialize data fetching hooks with customized loading setters
  const { teamMembers } = useTeamMembersFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('teamMembers', loading),
    handleError,
    enabled: dataFetchingEnabledRef.current
  });
  
  const { services } = useServicesFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('services', loading),
    handleError,
    enabled: dataFetchingEnabledRef.current
  });
  
  const { insurancePlans } = useInsurancePlansFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('insurancePlans', loading),
    handleError,
    enabled: dataFetchingEnabledRef.current
  });
  
  const { timeSlots } = useTimeSlotsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('timeSlots', loading),
    handleError,
    enabled: dataFetchingEnabledRef.current
  });
  
  const { appointments } = useAppointmentsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('appointments', loading),
    handleError,
    enabled: dataFetchingEnabledRef.current
  });

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
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Enable data fetching
      dataFetchingEnabledRef.current = true;
      
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
    setDataError
  };
};
