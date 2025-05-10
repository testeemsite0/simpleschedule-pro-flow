
import { useState, useEffect } from 'react';
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
    clearError 
  } = useDataLoadingState({ showToast: true });
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Track individual data loading states to prevent update loops
  const [loadingStates, setLoadingStates] = useState({
    teamMembers: false,
    services: false,
    insurancePlans: false,
    timeSlots: false,
    appointments: false
  });
  
  // Custom loading setter for each data type
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

  // Combined fetch for all data - initialize the process but don't create a render loop
  useEffect(() => {
    // Skip if no professional ID is provided
    if (!professionalId) {
      console.log("No professional ID provided, skipping data fetching");
      setIsLoading(false);
      return;
    }
    
    // Clear any previous errors when starting a new fetch
    clearError();
    
    console.log("Booking data fetching: Data loading initiated for professional ID:", professionalId);
    // Each individual hook handles its own data fetching
    
  }, [professionalId, clearError]);  // Removed setIsLoading from dependencies

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
