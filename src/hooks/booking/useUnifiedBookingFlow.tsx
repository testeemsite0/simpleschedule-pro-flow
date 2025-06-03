import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useBookingSteps, BookingStep } from './useBookingSteps';
import { useBookingDataFetching } from './useBookingDataFetching';
import { useBookingServices } from './useBookingServices';
import { useBookingAppointment } from './useBookingAppointment';
import { useAvailabilityCalculation } from './useAvailabilityCalculation';
import { useMaintenanceMode } from './useMaintenanceMode';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';
import { MIN_REFRESH_INTERVAL } from './api/constants';
import { clearBookingCache } from './api/dataLoader';

interface UseUnifiedBookingFlowProps {
  professionalId?: string;
  professionalSlug?: string;
  isAdminView?: boolean;
  initialStep?: BookingStep;
}

export const useUnifiedBookingFlow = ({
  professionalId,
  professionalSlug,
  isAdminView = false,
  initialStep
}: UseUnifiedBookingFlowProps = {}) => {
  // Track initialization and prevent excessive updates
  const isInitialized = useRef<boolean>(false);
  const lastUpdate = useRef<number>(0);
  const professionalIdRef = useRef<string | undefined>(professionalId);
  
  // Use refactored hooks for better separation of concerns
  const bookingSteps = useBookingSteps({
    initialStep: initialStep || "team-member"
  });
  
  // Function to handle errors consistently
  const handleDataError = useCallback((error: Error | null) => {
    if (error) {
      console.error("useUnifiedBookingFlow: Booking data error:", error);
      bookingSteps.updateErrorState(error.message || "Erro ao carregar dados");
    }
  }, [bookingSteps]);
  
  // Booking data fetching with optimized loading - now supports both ID and slug
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

  // Services-related utilities
  const {
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  } = useBookingServices({
    services,
    insurancePlans
  });
  
  // Availability calculations
  const {
    availableDates,
    availableSlots
  } = useAvailabilityCalculation({
    timeSlots,
    appointments,
    teamMemberId: bookingSteps.bookingData.teamMemberId,
    date: bookingSteps.bookingData.date
  });
  
  // Appointment creation hook - use resolved professional ID
  const {
    isLoading: appointmentLoading,
    completeBooking
  } = useBookingAppointment({
    professionalId: resolvedProfessionalId || professionalId,
    isAdminView,
    bookingData: bookingSteps.bookingData,
    onSuccess: () => {
      // You can add more actions after success here if necessary
    },
    goToStep: bookingSteps.goToStep,
    updateErrorState: bookingSteps.updateErrorState,
    resetBooking: bookingSteps.resetBooking
  });
  
  // Handle professional ID changes
  useEffect(() => {
    const currentIdentifier = professionalId || professionalSlug;
    const previousIdentifier = professionalIdRef.current;
    
    // Skip if nothing changed
    if (currentIdentifier === previousIdentifier) {
      return;
    }
    
    // Track the new professional identifier
    console.log(`useUnifiedBookingFlow: Professional identifier changed from ${previousIdentifier} to ${currentIdentifier}`);
    professionalIdRef.current = professionalId;
    isInitialized.current = false;
    
    // Clear error state and cache when changing professional
    bookingSteps.updateErrorState(null);
    if (resolvedProfessionalId) {
      clearBookingCache(resolvedProfessionalId);
    }
  }, [professionalId, professionalSlug, bookingSteps, resolvedProfessionalId]);
  
  // Initial data loading - with optimization to prevent excessive loading
  useEffect(() => {
    // Skip if already initialized or no professional identifier
    if (isInitialized.current || (!professionalId && !professionalSlug)) {
      return;
    }
    
    const now = Date.now();
    
    // Prevent excessive refreshes (throttle)
    if (now - lastUpdate.current < MIN_REFRESH_INTERVAL) {
      console.log("useUnifiedBookingFlow: Skipping refresh - too soon since last update");
      return;
    }
    
    // Otherwise proceed with initialization
    console.log(`useUnifiedBookingFlow: Initializing flow for professional ${professionalId || professionalSlug}`);
    isInitialized.current = true;
    lastUpdate.current = now;
    
    // Handle any errors from data fetching
    if (dataError) {
      handleDataError(dataError);
    }
  }, [professionalId, professionalSlug, dataError, handleDataError]);
  
  // Monitor the teamMembers data
  useEffect(() => {
    if (teamMembers) {
      console.log(`useUnifiedBookingFlow: Team members updated, count: ${teamMembers.length}`);
    }
  }, [teamMembers]);
  
  // Optimized data refresh function with force refresh option
  const refreshData = useCallback(() => {
    const now = Date.now();
    
    // Prevent excessive refreshes
    if (now - lastUpdate.current < MIN_REFRESH_INTERVAL) {
      console.log("useUnifiedBookingFlow: Skipping refresh - too soon since last update");
      toast("Aguarde", {
        description: "Atualização já está em andamento",
      });
      return;
    }
    
    console.log("useUnifiedBookingFlow: Forcing data refresh");
    
    toast("Atualizando dados", {
      description: "Recarregando informações do sistema",
    });
    
    lastUpdate.current = now;
    bookingSteps.updateErrorState(null);
    
    // Clear the cache for the current professional
    if (resolvedProfessionalId) {
      clearBookingCache(resolvedProfessionalId);
    }
    
    // Force refresh all data
    refreshAllData(true);
  }, [bookingSteps, refreshAllData, resolvedProfessionalId]);
  
  const resetBooking = useCallback(() => {
    console.log("useUnifiedBookingFlow: Resetting booking state");
    bookingSteps.resetBooking();
    // Force data refresh when resetting
    refreshData();
  }, [bookingSteps, refreshData]);

  // Unified loading indicator
  const isLoading = dataLoading || appointmentLoading;
  
  // Debug logging
  console.log("useUnifiedBookingFlow state:", {
    teamMembersCount: teamMembers?.length || 0,
    servicesCount: services?.length || 0,
    currentStep: bookingSteps.currentStep,
    isLoading,
    hasError: !!bookingSteps.error || !!dataError,
    resolvedProfessionalId,
  });
  
  return {
    ...bookingSteps,
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    availableDates,
    availableSlots,
    isLoading,
    error: bookingSteps.error || dataError,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
    completeBooking,
    setMaintenanceMode,
    resetBooking,
    refreshData,
    resolvedProfessionalId
  };
};
