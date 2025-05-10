
import { useState, useEffect, useCallback, useRef } from 'react';
import { prewarmBookingDataCache, unifiedDataFetch } from './api/dataLoader';
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
  const loadAllData = useCallback(async () => {
    if (!professionalId || isFetchingRef.current) {
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("Already fetching data, skipping redundant request");
      return;
    }
    
    // Generate a unique fetch ID to detect stale loads
    const fetchId = `fetch_${Date.now()}`;
    activeFetchId.current = fetchId;
    isFetchingRef.current = true;
    
    setIsLoading(true);
    setDataError(null);
    loadAttempted.current = true;
    
    try {
      console.log("Starting unified data load for professional:", professionalId);
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
        console.log("Discarding stale fetch results");
        return;
      }
      
      // Update state with all fetched data
      if (results.teamMembers) setTeamMembers(results.teamMembers);
      if (results.services) setServices(results.services);
      if (results.insurancePlans) setInsurancePlans(results.insurancePlans);
      if (results.timeSlots) setTimeSlots(results.timeSlots);
      if (results.appointments) setAppointments(results.appointments);
      
      setAllDataLoaded(true);
      
      if (onDataLoaded) {
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
      }
    }
  }, [professionalId, handleError, onDataLoaded]);
  
  // Initialize data fetching
  useEffect(() => {
    // Reset state when professional ID changes
    if (professionalId !== undefined) {
      // Only fetch if we haven't attempted yet for this professional
      if (!loadAttempted.current) {
        loadAllData();
      }
    } else {
      // No professional ID provided
      setIsLoading(false);
      setTeamMembers([]);
      setServices([]);
      setInsurancePlans([]);
      setTimeSlots([]);
      setAppointments([]);
    }
    
    // Cleanup function
    return () => {
      // Nothing to clean up here
    };
  }, [professionalId, loadAllData]);
  
  // Function to refresh all data - exposed for manual refresh
  const refreshAllData = useCallback(() => {
    if (isFetchingRef.current) {
      console.log("Skipping refresh as data is currently being fetched");
      return;
    }
    
    loadAttempted.current = false; // Reset the load attempted flag
    loadAllData();
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
}, []);
