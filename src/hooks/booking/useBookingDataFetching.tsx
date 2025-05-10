
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
    handleError 
  } = useDataLoadingState();
  
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  const { teamMembers } = useTeamMembersFetching({ professionalId, setIsLoading, handleError });
  const { services } = useServicesFetching({ professionalId, setIsLoading, handleError });
  const { insurancePlans } = useInsurancePlansFetching({ professionalId, setIsLoading, handleError });
  const { timeSlots } = useTimeSlotsFetching({ professionalId, setIsLoading, handleError });
  const { appointments } = useAppointmentsFetching({ professionalId, setIsLoading, handleError });
  
  // Combined fetch for all data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!professionalId) {
        console.error("No professional ID provided for booking flow");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setDataError(null);
      
      try {
        // Data will be loaded by individual hooks
        console.log("Booking data fetching: Data loading initiated for professional ID:", professionalId);
      } catch (error) {
        console.error("Error loading unified booking data:", error);
        setDataError("Erro ao carregar dados para agendamento");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [professionalId, setIsLoading, setDataError]);

  return {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    setMaintenanceMode,
    isLoading,
    dataError
  };
};
