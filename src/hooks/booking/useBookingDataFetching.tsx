
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
  
  // Track individual data loading states
  const [loadingStates, setLoadingStates] = useState({
    teamMembers: false,
    services: false,
    insurancePlans: false,
    timeSlots: false,
    appointments: false
  });
  
  // Custom loading setter for each data type
  const setTypeLoading = (type: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [type]: loading }));
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
    setIsLoading(anyLoading);
  }, [loadingStates, setIsLoading]);

  // Combined fetch for all data - initialize the process
  useEffect(() => {
    const initiateFetching = async () => {
      if (!professionalId) {
        console.error("No professional ID provided for booking flow");
        setIsLoading(false);
        return;
      }
      
      // Clear any previous errors when starting a new fetch
      clearError();
      
      try {
        console.log("Booking data fetching: Data loading initiated for professional ID:", professionalId);
        // Individual hooks will handle their own data fetching
      } catch (error) {
        console.error("Error initializing unified booking data:", error);
        handleError("Erro ao iniciar carregamento de dados para agendamento", error);
      }
    };
    
    if (professionalId) {
      initiateFetching();
    } else {
      setIsLoading(false);
    }
  }, [professionalId, setIsLoading, clearError, handleError]);

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
