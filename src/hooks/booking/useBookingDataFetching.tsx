
import { useState, useEffect, useRef } from 'react';
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
    cleanup: cleanupLoadingState
  } = useDataLoadingState({ showToast: true });
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Track if this hook has been initialized with the professionalId
  const initializedRef = useRef(false);
  const professionalIdRef = useRef<string | undefined>(undefined);
  
  // Track individual data loading states to prevent update loops
  const [loadingStates, setLoadingStates] = useState({
    teamMembers: false,
    services: false,
    insurancePlans: false,
    timeSlots: false,
    appointments: false
  });
  
  // Custom loading setter for each data type with debounce protection
  const setTypeLoading = (type: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => {
      // Only update if the value is actually changing to prevent loops
      if (prev[type] === loading) return prev;
      return { ...prev, [type]: loading };
    });
  };
  
  // Initialize data fetching hooks with customized loading setters
  const { teamMembers } = useTeamMembersFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('teamMembers', loading),
    handleError 
  });
  
  const { services } = useServicesFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('services', loading),
    handleError 
  });
  
  const { insurancePlans } = useInsurancePlansFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('insurancePlans', loading),
    handleError 
  });
  
  const { timeSlots } = useTimeSlotsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('timeSlots', loading),
    handleError 
  });
  
  const { appointments } = useAppointmentsFetching({ 
    professionalId, 
    setIsLoading: (loading) => setTypeLoading('appointments', loading),
    handleError 
  });
  
  // Update overall loading state based on individual states
  useEffect(() => {
    const anyLoading = Object.values(loadingStates).some(state => state === true);
    
    // Avoid unnecessary re-renders that could cause infinite loading
    if (isLoading !== anyLoading) {
      setIsLoading(anyLoading);
    }
  }, [loadingStates, setIsLoading, isLoading]);

  // Only trigger data fetching once per professionalId and prevent unwanted re-initialization
  useEffect(() => {
    // Skip if no professional ID is provided or it hasn't changed
    if (!professionalId || professionalId === professionalIdRef.current) {
      return;
    }
    
    // Update the ref to track the current professionalId
    professionalIdRef.current = professionalId;
    
    // Only log and perform initialization once per professional ID change
    if (!initializedRef.current) {
      console.log("Booking data fetching: Initial data loading for professional ID:", professionalId);
      initializedRef.current = true;
    }
    
    // Clear any previous errors when starting a new fetch with a different ID
    clearError();
    
  }, [professionalId, clearError]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanupLoadingState();
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
