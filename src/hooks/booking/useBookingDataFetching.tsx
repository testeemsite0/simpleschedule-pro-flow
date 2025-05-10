
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDataLoadingState } from './useDataLoadingState';
import { useTeamMembersFetching } from './useTeamMembersFetching';
import { useServicesFetching } from './useServicesFetching';
import { useInsurancePlansFetching } from './useInsurancePlansFetching';
import { useTimeSlotsFetching } from './useTimeSlotsFetching';
import { useAppointmentsFetching } from './useAppointmentsFetching';
import { useMaintenanceMode } from './useMaintenanceMode';
import { prewarmBookingDataCache } from './api/dataFetcher'; 
import { toast } from 'sonner';

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
    showToast: false, // Disable toast for better UX, we'll handle our own toast
    maxRetries: 1,     // Reduce retries to speed up loading
    loadingTimeout: 8000 // Reduced timeout to 8 seconds
  });
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Track if this hook has been initialized with the professionalId
  const initializedRef = useRef(false);
  const professionalIdRef = useRef<string | undefined>(undefined);
  const dataFetchingEnabledRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const minFetchIntervalMs = 10000; // 10 seconds minimum between full refetches
  
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
  
  // Track if any data type is loaded
  const dataLoadedRef = useRef({
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
      
      // Check if any essential type is still loading
      const essentialLoading = loadingStatesRef.current.teamMembers || 
                              loadingStatesRef.current.services;
                              
      // Only show loading state for essential data
      setIsLoading(essentialLoading);
    }
  }, [setIsLoading]);
  
  // Sequential loading flag to control loading order
  const [loadingStage, setLoadingStage] = useState<number>(0);
  
  // Initialize data fetching hooks with customized loading setters
  const { teamMembers, fetchTeamMembers } = useTeamMembersFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('teamMembers', loading),
    handleError: (context, e) => {
      handleError(context, e);
      if (!dataLoadedRef.current.teamMembers) {
        toast.error("Erro ao carregar dados dos profissionais");
      }
    },
    enabled: loadingStage === 0, // First stage
    onSuccess: () => { dataLoadedRef.current.teamMembers = true; }
  });
  
  const { services, fetchServices } = useServicesFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('services', loading),
    handleError: (context, e) => {
      handleError(context, e);
      if (!dataLoadedRef.current.services) {
        toast.error("Erro ao carregar dados dos serviços");
      }
    },
    enabled: loadingStage === 0, // First stage
    onSuccess: () => { dataLoadedRef.current.services = true; }
  });
  
  const { timeSlots, fetchTimeSlots } = useTimeSlotsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('timeSlots', loading),
    handleError: (context, e) => {
      handleError(context, e);
      // Don't show toast for non-essential data
    },
    enabled: loadingStage === 1, // Second stage
    onSuccess: () => { dataLoadedRef.current.timeSlots = true; }
  });
  
  const { insurancePlans, fetchInsurancePlans } = useInsurancePlansFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('insurancePlans', loading),
    handleError: (context, e) => {
      handleError(context, e);
      // Don't show toast for non-essential data
    },
    enabled: loadingStage === 1, // Second stage
    onSuccess: () => { dataLoadedRef.current.insurancePlans = true; }
  });
  
  const { appointments, fetchAppointments } = useAppointmentsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('appointments', loading),
    handleError: (context, e) => {
      handleError(context, e);
      // Don't show toast for non-essential data
    },
    enabled: loadingStage === 2, // Last stage
    onSuccess: () => { dataLoadedRef.current.appointments = true; }
  });

  // Progress to next loading stage
  const moveToNextLoadingStage = useCallback(() => {
    setLoadingStage(prev => Math.min(prev + 1, 3)); // Max 3 stages (0-2)
  }, []);

  // Sequential loading logic with better error handling and performance
  useEffect(() => {
    if (!professionalId || !dataFetchingEnabledRef.current) {
      return;
    }

    // Check if we've fetched data too recently to prevent excessive API calls
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Only enforce minimum interval for full refetches, not initial loads
    if (lastFetchTimeRef.current > 0 && timeSinceLastFetch < minFetchIntervalMs) {
      console.log(`Skipping fetch - last fetch was ${timeSinceLastFetch}ms ago (min interval: ${minFetchIntervalMs}ms)`);
      return;
    }

    const loadData = async () => {
      try {
        // Update the last fetch timestamp
        lastFetchTimeRef.current = now;

        // Use a staged approach for better UX
        if (loadingStage === 0) {
          // Stage 0: Load essential data in parallel (team members and services)
          await Promise.allSettled([
            fetchTeamMembers(abortControllerRef.current?.signal),
            fetchServices(abortControllerRef.current?.signal)
          ]);
          
          // Move to next stage regardless of errors to prevent getting stuck
          moveToNextLoadingStage();
        }
        else if (loadingStage === 1) {
          // Stage 1: Load secondary data in parallel
          await Promise.allSettled([
            fetchTimeSlots(abortControllerRef.current?.signal),
            fetchInsurancePlans(abortControllerRef.current?.signal)
          ]);
          
          // Move to next stage regardless of errors
          moveToNextLoadingStage();
        }
        else if (loadingStage === 2) {
          // Stage 2: Load non-critical data
          await fetchAppointments(abortControllerRef.current?.signal)
            .catch(error => {
              console.warn("Error fetching appointments, continuing anyway:", error);
            });
            
          moveToNextLoadingStage();
        }
      } catch (error) {
        console.error(`Error in sequential loading stage ${loadingStage}:`, error);
        
        // Continue to next stage even with errors to prevent getting stuck
        moveToNextLoadingStage();
      }
    };

    loadData();
  }, [professionalId, loadingStage, fetchTeamMembers, fetchServices, fetchTimeSlots, fetchInsurancePlans, fetchAppointments, moveToNextLoadingStage]);

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
      
      // Reset data loaded states
      Object.keys(dataLoadedRef.current).forEach(key => {
        dataLoadedRef.current[key as keyof typeof dataLoadedRef.current] = false;
      });
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Enable data fetching
      dataFetchingEnabledRef.current = true;
      
      // Try to pre-warm cache
      prewarmBookingDataCache(professionalId)
        .catch(e => console.warn("Error pre-warming cache:", e));
      
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

  // Public interface with additional information about data loading status
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
    // Track what data has been loaded
    dataLoaded: {
      teamMembers: dataLoadedRef.current.teamMembers,
      services: dataLoadedRef.current.services,
      insurancePlans: dataLoadedRef.current.insurancePlans,
      timeSlots: dataLoadedRef.current.timeSlots,
      appointments: dataLoadedRef.current.appointments
    },
    // Add refresh methods to manually trigger data refetching if needed
    refreshTeamMembers: () => fetchTeamMembers(),
    refreshServices: () => fetchServices(),
    refreshTimeSlots: () => fetchTimeSlots(),
    refreshInsurancePlans: () => fetchInsurancePlans(),
    refreshAppointments: () => fetchAppointments(),
    // Force refresh everything
    refreshAll: () => {
      // Only allow full refresh if enough time has passed since last fetch
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      if (timeSinceLastFetch < minFetchIntervalMs) {
        console.log(`Skipping force refresh - last fetch was only ${timeSinceLastFetch}ms ago`);
        toast.info("Atualizando dados...");
        return;
      }
      
      setLoadingStage(0);
      lastFetchTimeRef.current = 0;
      
      // Reset data loaded states
      Object.keys(dataLoadedRef.current).forEach(key => {
        dataLoadedRef.current[key as keyof typeof dataLoadedRef.current] = false;
      });
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      toast.info("Atualizando dados...");
    }
  };
};
