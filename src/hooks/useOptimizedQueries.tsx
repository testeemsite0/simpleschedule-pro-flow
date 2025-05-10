
import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import {
  fetchTeamMembers,
  fetchServices,
  fetchInsurancePlans,
  fetchTimeSlots,
  fetchAppointments
} from './booking/api/dataFetcher';
import { QueryCache, generateCacheKey } from './booking/cache/queryCache';

// Hook para buscar múltiplos tipos de dados relacionados em uma única chamada
export const useOptimizedQueries = (professionalId: string | undefined) => {
  const [data, setData] = useState<{
    teamMembers: any[];
    services: any[];
    insurancePlans: any[];
    timeSlots: any[];
    appointments: any[];
    isLoading: boolean;
    error: string | null;
  }>({
    teamMembers: [],
    services: [],
    insurancePlans: [],
    timeSlots: [],
    appointments: [],
    isLoading: true,
    error: null
  });

  // Abort controller for canceling requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    if (!professionalId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Create a new AbortController for this fetch operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      console.log("useOptimizedQueries: Pre-warming booking data cache");
      
      // Fetch critical data first in parallel with immediate execution
      const teamMembersPromise = fetchTeamMembers(professionalId, signal);
      const servicesPromise = fetchServices(professionalId, signal);
      
      const [teamMembers, services] = await Promise.all([
        teamMembersPromise,
        servicesPromise
      ]);
      
      console.log(`useOptimizedQueries: Pre-warmed team members: ${teamMembers.length}, services: ${Array.isArray(services) ? services.length : 'undefined'}`);
      
      // Then fetch non-critical data in parallel but with lower priority
      const [
        timeSlotsResult,
        insurancePlansResult,
        appointmentsResult
      ] = await Promise.allSettled([
        fetchTimeSlots(professionalId, signal),
        fetchInsurancePlans(professionalId, signal),
        fetchAppointments(professionalId, signal)
      ]);
      
      // Process results
      const timeSlots = timeSlotsResult.status === 'fulfilled' ? timeSlotsResult.value : [];
      const insurancePlans = insurancePlansResult.status === 'fulfilled' ? insurancePlansResult.value : [];
      const appointments = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : [];
      
      // Update state with all fetched data
      setData({
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
        services: Array.isArray(services) ? services : [],
        insurancePlans: Array.isArray(insurancePlans) ? insurancePlans : [],
        timeSlots: Array.isArray(timeSlots) ? timeSlots : [],
        appointments: Array.isArray(appointments) ? appointments : [],
        isLoading: false,
        error: null
      });
      
      console.log("useOptimizedQueries: Cache pre-warming complete for all data");
    } catch (error) {
      console.error("useOptimizedQueries: Error pre-warming cache:", error);
      
      if (!signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: `Falha ao buscar dados: ${errorMessage}`
        }));

        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar as informações necessárias",
          variant: "destructive"
        });
      }
    }
  }, [professionalId, toast]);

  // Effect to fetch data when professionalId changes
  useEffect(() => {
    if (professionalId) {
      setData(prev => ({ ...prev, isLoading: true }));
      fetchAllData();
    }
    
    // Cleanup function to abort pending requests when the component unmounts
    // or when professionalId changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [professionalId, fetchAllData]);

  // Public API to manually refetch data
  const refetch = useCallback(() => {
    // Clear all cache entries related to this professional
    if (professionalId) {
      ['teamMembers', 'services', 'insurancePlans', 'timeSlots', 'appointments'].forEach(type => {
        QueryCache.invalidate(generateCacheKey(type, professionalId));
      });
    }
    
    setData(prev => ({ ...prev, isLoading: true }));
    fetchAllData();
  }, [professionalId, fetchAllData]);

  // Add a function to invalidate specific cache entries
  const invalidateCache = useCallback((type?: string) => {
    if (!professionalId) return;
    
    if (type) {
      // Invalidate specific data type
      QueryCache.invalidate(generateCacheKey(type, professionalId));
    } else {
      // Invalidate all data types for this professional
      ['teamMembers', 'services', 'insurancePlans', 'timeSlots', 'appointments'].forEach(t => {
        QueryCache.invalidate(generateCacheKey(t, professionalId));
      });
    }
  }, [professionalId]);

  return {
    ...data,
    refetch,
    invalidateCache
  };
};
