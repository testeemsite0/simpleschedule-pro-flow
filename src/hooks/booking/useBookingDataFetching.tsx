
import { useState, useEffect } from 'react';
import { prewarmBookingDataCache } from './api/dataLoader';
import { useTeamMembersFetching } from './fetching/useTeamMembersFetching';
import { useServicesFetching } from './fetching/useServicesFetching';
import { useTimeSlotsFetching } from './fetching/useTimeSlotsFetching';
import { useInsurancePlansFetching } from './fetching/useInsurancePlansFetching';
import { useAppointmentsFetching } from './fetching/useAppointmentsFetching';
import { useMaintenanceMode } from './useMaintenanceMode';

interface UseBookingDataFetchingProps {
  professionalId?: string;
  onDataLoaded?: () => void;
  onError?: (error: Error) => void;
}

export const useBookingDataFetching = ({
  professionalId,
  onDataLoaded,
  onError
}: UseBookingDataFetchingProps = {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<Error | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
  
  // Maintenance mode state
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Centralized error handler
  const handleError = (context: string, error: Error) => {
    console.error(`Error in ${context}:`, error);
    setDataError(error);
    if (onError) {
      onError(error);
    }
  };
  
  // Track loading state for individual data types
  const [loadingStates, setLoadingStates] = useState({
    teamMembers: true,
    services: true,
    insurancePlans: true,
    timeSlots: true,
    appointments: true,
  });
  
  // Success handler
  const handleSuccess = (dataType: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [dataType]: false }));
  };
  
  // Team members fetching
  const { 
    teamMembers,
    refetchTeamMembers
  } = useTeamMembersFetching({
    professionalId,
    onSuccess: () => handleSuccess('teamMembers'),
    onError: (error) => handleError('useTeamMembersFetching', error)
  });
  
  // Services fetching
  const { 
    services,
    refetchServices
  } = useServicesFetching({
    professionalId,
    onSuccess: () => handleSuccess('services'),
    onError: (error) => handleError('useServicesFetching', error)
  });
  
  // Time slots fetching
  const { 
    timeSlots,
    refetchTimeSlots
  } = useTimeSlotsFetching({
    professionalId,
    onSuccess: () => handleSuccess('timeSlots'),
    onError: (error) => handleError('useTimeSlotsFetching', error)
  });
  
  // Insurance plans fetching
  const { 
    insurancePlans,
    refetchInsurancePlans
  } = useInsurancePlansFetching({
    professionalId,
    onSuccess: () => handleSuccess('insurancePlans'),
    onError: (error) => handleError('useInsurancePlansFetching', error)
  });
  
  // Appointments fetching
  const { 
    appointments,
    refetchAppointments
  } = useAppointmentsFetching({
    professionalId,
    onSuccess: () => handleSuccess('appointments'),
    onError: (error) => handleError('useAppointmentsFetching', error)
  });
  
  // Update overall loading state when individual states change
  useEffect(() => {
    const isStillLoading = Object.values(loadingStates).some(state => state === true);
    setIsLoading(isStillLoading);
    
    if (!isStillLoading && !allDataLoaded) {
      setAllDataLoaded(true);
      if (onDataLoaded) {
        onDataLoaded();
      }
    }
  }, [loadingStates, allDataLoaded, onDataLoaded]);
  
  // Initialize data fetching
  useEffect(() => {
    if (professionalId) {
      // Reset error state
      setDataError(null);
      setAllDataLoaded(false);
      
      // Reset loading states
      setLoadingStates({
        teamMembers: true,
        services: true,
        insurancePlans: true,
        timeSlots: true,
        appointments: true,
      });
      
      // Prewarm cache to optimize loading
      prewarmBookingDataCache(professionalId)
        .catch(error => console.warn("Error prewarming cache:", error));
    } else {
      // No professional ID provided
      setIsLoading(false);
    }
  }, [professionalId]);
  
  // Function to refresh all data
  const refreshAllData = () => {
    if (!professionalId) return;
    
    setLoadingStates({
      teamMembers: true,
      services: true,
      insurancePlans: true,
      timeSlots: true,
      appointments: true,
    });
    
    refetchTeamMembers();
    refetchServices();
    refetchInsurancePlans();
    refetchTimeSlots();
    refetchAppointments();
  };
  
  return {
    // Data
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    
    // Status
    isLoading,
    dataError,
    maintenanceMode,
    
    // Actions
    setMaintenanceMode,
    refreshAllData
  };
};
