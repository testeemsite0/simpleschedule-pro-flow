
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBookingDataFetching } from '../useBookingDataFetching';
import { MIN_REFRESH_INTERVAL } from '../api/constants';
import { clearBookingCache } from '../api/dataLoader';
import { toast } from 'sonner';

interface UseBookingDataLoaderProps {
  professionalId?: string;
  professionalSlug?: string;
  onError?: (error: Error) => void;
}

export const useBookingDataLoader = ({
  professionalId,
  professionalSlug,
  onError
}: UseBookingDataLoaderProps) => {
  const isInitialized = useRef<boolean>(false);
  const lastUpdate = useRef<number>(0);
  const professionalIdRef = useRef<string | undefined>(professionalId);

  const handleDataError = useCallback((error: Error | null) => {
    if (error && onError) {
      onError(error);
    }
  }, [onError]);

  const {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    resolvedProfessionalId,
    maintenanceMode,
    setMaintenanceMode,
    isLoading: dataLoading,
    dataError,
    refreshAllData
  } = useBookingDataFetching({
    professionalId,
    professionalSlug,
    onError: handleDataError
  });

  // Handle professional ID changes
  useEffect(() => {
    const currentIdentifier = professionalId || professionalSlug;
    const previousIdentifier = professionalIdRef.current;
    
    if (currentIdentifier === previousIdentifier) {
      return;
    }
    
    professionalIdRef.current = professionalId;
    isInitialized.current = false;
    
    if (resolvedProfessionalId) {
      clearBookingCache(resolvedProfessionalId);
    }
  }, [professionalId, professionalSlug, resolvedProfessionalId]);

  // Initial data loading
  useEffect(() => {
    if (isInitialized.current || (!professionalId && !professionalSlug)) {
      return;
    }
    
    const now = Date.now();
    
    if (now - lastUpdate.current < MIN_REFRESH_INTERVAL) {
      return;
    }
    
    isInitialized.current = true;
    lastUpdate.current = now;
    
    if (dataError) {
      handleDataError(dataError);
    }
  }, [professionalId, professionalSlug, dataError, handleDataError]);

  const refreshData = useCallback(() => {
    const now = Date.now();
    
    if (now - lastUpdate.current < MIN_REFRESH_INTERVAL) {
      toast("Aguarde", {
        description: "Atualização já está em andamento",
      });
      return;
    }
    
    toast("Atualizando dados", {
      description: "Recarregando informações do sistema",
    });
    
    lastUpdate.current = now;
    
    if (resolvedProfessionalId) {
      clearBookingCache(resolvedProfessionalId);
    }
    
    refreshAllData(true);
  }, [refreshAllData, resolvedProfessionalId]);

  return {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    resolvedProfessionalId,
    maintenanceMode,
    setMaintenanceMode,
    isLoading: dataLoading,
    dataError,
    refreshData
  };
};
