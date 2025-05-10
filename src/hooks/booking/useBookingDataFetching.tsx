
import { useState, useEffect, useCallback, useRef } from 'react';
import { prewarmBookingDataCache, unifiedDataFetch, clearBookingCache } from './api/dataLoader';
import { TeamMember, Service, InsurancePlan, TimeSlot, Appointment } from '@/types';
import { useMaintenanceMode } from './useMaintenanceMode';
import { fetchTeamMembers, fetchServices, fetchInsurancePlans, fetchTimeSlots, fetchAppointments } from './api/dataLoader';

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
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<Error | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
  
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
  
  // Unified data loading function that loads all data types at once
  const loadAllData = useCallback(async (forceRefresh: boolean = false) => {
    if (!professionalId) {
      console.log("useBookingDataFetching: No professionalId provided, skipping data load");
      setIsLoading(false);
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("useBookingDataFetching: Already fetching data, skipping redundant request");
      return;
    }
    
    // Log if professional ID changed
    if (professionalIdRef.current !== professionalId) {
      console.log(`useBookingDataFetching: Professional ID changed from ${professionalIdRef.current} to ${professionalId}`);
      professionalIdRef.current = professionalId;
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
      clearBookingCache(professionalId);
    }
    
    try {
      console.log("useBookingDataFetching: Starting unified data load for professional:", professionalId);
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Setup query functions map
      const queryFns = {
        teamMembers: () => fetchTeamMembers(professionalId, signal),
        services: () => fetchServices(professionalId, signal),
        insurancePlans: () => fetchInsurancePlans(professionalId, signal),
        timeSlots: () => fetchTimeSlots(professionalId, signal),
        appointments: () => fetchAppointments(professionalId, signal)
      };
      
      // Load all data types in an optimized batch
      const results = await unifiedDataFetch<any>(
        professionalId,
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
  }, [professionalId, handleError, onDataLoaded]);
  
  // Initialize data fetching
  useEffect(() => {
    // Reset state when professional ID changes
    if (professionalId !== undefined && professionalId !== professionalIdRef.current) {
      console.log(`useBookingDataFetching: Professional ID changed to ${professionalId}, resetting state`);
      professionalIdRef.current = professionalId;
      loadAttempted.current = false;
      // Reset the data states
      setTeamMembers([]);
      setServices([]);
      setInsurancePlans([]);
      setTimeSlots([]);
      setAppointments([]);
    }
    
    if (professionalId !== undefined) {
      // Only fetch if we haven't attempted yet for this professional
      if (!loadAttempted.current) {
        console.log(`useBookingDataFetching: First load for professional ${professionalId}`);
        loadAllData(true); // Force refresh on first load
      }
    } else {
      // No professional ID provided
      console.log("useBookingDataFetching: No professionalId, clearing data");
      setIsLoading(false);
      setTeamMembers([]);
      setServices([]);
      setInsurancePlans([]);
      setTimeSlots([]);
      setAppointments([]);
    }
  }, [professionalId, loadAllData]);
  
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
    
    // Status
    isLoading,
    dataError,
    maintenanceMode,
    
    // Actions
    setMaintenanceMode,
    refreshAllData
  };
};
