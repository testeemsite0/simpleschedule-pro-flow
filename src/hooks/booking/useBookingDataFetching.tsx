
import { useState, useEffect, useCallback, useRef } from 'react';
import { prewarmBookingDataCache, unifiedDataFetch, clearBookingCache } from './api/dataLoader';
import { TeamMember, Service, InsurancePlan, TimeSlot, Appointment } from '@/types';
import { useMaintenanceMode } from './useMaintenanceMode';
import { fetchTeamMembers, fetchServices, fetchInsurancePlans, fetchTimeSlots, fetchAppointments } from './api/dataLoader';
import { fetchProfessionalBySlug } from './api/professionalApi';

interface UseBookingDataFetchingProps {
  professionalId?: string;
  professionalSlug?: string;
  onDataLoaded?: () => void;
  onError?: (error: Error) => void;
}

export const useBookingDataFetching = ({
  professionalId,
  professionalSlug,
  onDataLoaded,
  onError
}: UseBookingDataFetchingProps = {}) => {
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<Error | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
  const [resolvedProfessionalId, setResolvedProfessionalId] = useState<string | undefined>(professionalId);
  
  // Prevent re-fetching loops
  const isFetchingRef = useRef(false);
  const loadAttempted = useRef(false);
  const activeFetchId = useRef<string>('');
  const professionalIdRef = useRef<string | undefined>(professionalId);
  
  // Maintenance mode state
  const { maintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  
  // Centralized error handler
  const handleError = useCallback((context: string, error: Error) => {
    console.error(`Error in ${context}:`, error);
    setDataError(error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Function to resolve professional slug to ID
  const resolveProfessionalId = useCallback(async () => {
    if (professionalId) {
      console.log("useBookingDataFetching: Using provided professionalId:", professionalId);
      setResolvedProfessionalId(professionalId);
      return professionalId;
    }
    
    if (professionalSlug) {
      console.log("useBookingDataFetching: Resolving professionalSlug to ID:", professionalSlug);
      try {
        const { data: professional, error } = await fetchProfessionalBySlug(professionalSlug);
        if (error) {
          throw new Error(error);
        }
        if (!professional) {
          throw new Error(`Professional not found for slug: ${professionalSlug}`);
        }
        console.log("useBookingDataFetching: Resolved professional:", professional);
        setResolvedProfessionalId(professional.id);
        return professional.id;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError('resolveProfessionalId', error);
        return null;
      }
    }
    
    console.log("useBookingDataFetching: No professionalId or professionalSlug provided");
    return null;
  }, [professionalId, professionalSlug, handleError]);
  
  // Unified data loading function that loads all data types at once
  const loadAllData = useCallback(async (forceRefresh: boolean = false) => {
    // First resolve the professional ID
    const finalProfessionalId = await resolveProfessionalId();
    
    if (!finalProfessionalId) {
      console.log("useBookingDataFetching: No professionalId resolved, skipping data load");
      setIsLoading(false);
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("useBookingDataFetching: Already fetching data, skipping redundant request");
      return;
    }
    
    // Log if professional ID changed
    if (professionalIdRef.current !== finalProfessionalId) {
      console.log(`useBookingDataFetching: Professional ID changed from ${professionalIdRef.current} to ${finalProfessionalId}`);
      professionalIdRef.current = finalProfessionalId;
    }
    
    // Generate a unique fetch ID to detect stale loads
    const fetchId = `fetch_${Date.now()}`;
    activeFetchId.current = fetchId;
    isFetchingRef.current = true;
    
    setIsLoading(true);
    setDataError(null);
    loadAttempted.current = true;
    
    // Force cache refresh if requested
    if (forceRefresh) {
      console.log("useBookingDataFetching: Forcing cache refresh");
      clearBookingCache(finalProfessionalId);
    }
    
    try {
      console.log("useBookingDataFetching: Starting unified data load for professional:", finalProfessionalId);
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Setup query functions map
      const queryFns = {
        teamMembers: () => fetchTeamMembers(finalProfessionalId, signal),
        services: () => fetchServices(finalProfessionalId, signal),
        insurancePlans: () => fetchInsurancePlans(finalProfessionalId, signal),
        timeSlots: () => fetchTimeSlots(finalProfessionalId, signal),
        appointments: () => fetchAppointments(finalProfessionalId, signal)
      };
      
      // Load all data types in an optimized batch
      const results = await unifiedDataFetch<any>(
        finalProfessionalId,
        ['teamMembers', 'services', 'insurancePlans', 'timeSlots', 'appointments'],
        queryFns,
        signal
      );
      
      // If this load was superseded by another, discard results
      if (activeFetchId.current !== fetchId) {
        console.log("useBookingDataFetching: Discarding stale fetch results");
        return;
      }
      
      // Debug log for each data type
      console.log("useBookingDataFetching: Results received:", {
        teamMembers: results.teamMembers ? `${results.teamMembers.length} items` : 'undefined',
        services: results.services ? `${results.services.length} items` : 'undefined',
        insurancePlans: results.insurancePlans ? `${results.insurancePlans.length} items` : 'undefined',
        timeSlots: results.timeSlots ? `${results.timeSlots.length} items` : 'undefined',
        appointments: results.appointments ? `${results.appointments.length} items` : 'undefined'
      });
      
      // Update state with all fetched data
      if (results.teamMembers) {
        console.log(`useBookingDataFetching: Setting ${results.teamMembers.length} team members`);
        setTeamMembers(results.teamMembers);
      }
      
      if (results.services) setServices(results.services);
      if (results.insurancePlans) setInsurancePlans(results.insurancePlans);
      if (results.timeSlots) setTimeSlots(results.timeSlots);
      if (results.appointments) setAppointments(results.appointments);
      
      setAllDataLoaded(true);
      
      if (onDataLoaded) {
        console.log("useBookingDataFetching: Calling onDataLoaded callback");
        onDataLoaded();
      }
      
    } catch (err: any) {
      if (activeFetchId.current !== fetchId) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      handleError('loadAllData', error);
    } finally {
      // Only update if this is still the active fetch
      if (activeFetchId.current === fetchId) {
        setIsLoading(false);
        isFetchingRef.current = false;
        console.log("useBookingDataFetching: Data loading complete");
      }
    }
  }, [resolveProfessionalId, handleError, onDataLoaded]);
  
  // Initialize data fetching
  useEffect(() => {
    // Reset state when professional ID or slug changes
    const currentIdentifier = professionalId || professionalSlug;
    const previousIdentifier = professionalIdRef.current;
    
    if (currentIdentifier !== previousIdentifier) {
      console.log(`useBookingDataFetching: Professional identifier changed to ${currentIdentifier}, resetting state`);
      loadAttempted.current = false;
      // Reset the data states
      setTeamMembers([]);
      setServices([]);
      setInsurancePlans([]);
      setTimeSlots([]);
      setAppointments([]);
      setResolvedProfessionalId(undefined);
    }
    
    if (professionalId || professionalSlug) {
      // Only fetch if we haven't attempted yet for this professional
      if (!loadAttempted.current) {
        console.log(`useBookingDataFetching: First load for professional ${professionalId || professionalSlug}`);
        loadAllData(true); // Force refresh on first load
      }
    } else {
      // No professional ID or slug provided
      console.log("useBookingDataFetching: No professionalId or professionalSlug, clearing data");
      setIsLoading(false);
      setTeamMembers([]);
      setServices([]);
      setInsurancePlans([]);
      setTimeSlots([]);
      setAppointments([]);
    }
  }, [professionalId, professionalSlug, loadAllData]);
  
  // Function to refresh all data - exposed for manual refresh
  const refreshAllData = useCallback((forceRefresh: boolean = true) => {
    if (isFetchingRef.current) {
      console.log("useBookingDataFetching: Skipping refresh as data is currently being fetched");
      return;
    }
    
    console.log("useBookingDataFetching: Manually refreshing all data");
    loadAttempted.current = false; // Reset the load attempted flag
    loadAllData(forceRefresh);
  }, [loadAllData]);
  
  return {
    // Data
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    resolvedProfessionalId,
    
    // Status
    isLoading,
    dataError,
    maintenanceMode,
    
    // Actions
    setMaintenanceMode,
    refreshAllData
  };
};
