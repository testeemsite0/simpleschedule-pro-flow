
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
      // Track which data types have been successfully fetched
      const results: Partial<{
        teamMembers: any[];
        services: any[];
        insurancePlans: any[];
        timeSlots: any[];
        appointments: any[];
      }> = {};
      
      // Fetch all data types in parallel with proper error handling
      const [
        teamMembersResult,
        servicesResult,
        insurancePlansResult,
        timeSlotsResult,
        appointmentsResult
      ] = await Promise.allSettled([
        fetchTeamMembers(professionalId, signal),
        fetchServices(professionalId, signal),
        fetchInsurancePlans(professionalId, signal),
        fetchTimeSlots(professionalId, signal),
        fetchAppointments(professionalId, signal)
      ]);

      // Process results and collect errors
      const errors: string[] = [];
      
      if (teamMembersResult.status === 'fulfilled') {
        results.teamMembers = teamMembersResult.value;
      } else {
        errors.push(`Falha ao buscar membros da equipe: ${teamMembersResult.reason}`);
      }
      
      if (servicesResult.status === 'fulfilled') {
        results.services = servicesResult.value;
      } else {
        errors.push(`Falha ao buscar serviços: ${servicesResult.reason}`);
      }
      
      if (insurancePlansResult.status === 'fulfilled') {
        results.insurancePlans = insurancePlansResult.value;
      } else {
        errors.push(`Falha ao buscar convênios: ${insurancePlansResult.reason}`);
      }
      
      if (timeSlotsResult.status === 'fulfilled') {
        results.timeSlots = timeSlotsResult.value;
      } else {
        errors.push(`Falha ao buscar horários: ${timeSlotsResult.reason}`);
      }
      
      if (appointmentsResult.status === 'fulfilled') {
        results.appointments = appointmentsResult.value;
      } else {
        errors.push(`Falha ao buscar agendamentos: ${appointmentsResult.reason}`);
      }

      if (errors.length > 0) {
        // Report errors but don't fail completely if we have partial data
        console.error("Some data fetching operations failed:", errors);
        
        // Show a toast for the user
        if (errors.length < 3) {
          // Show individual errors if there are only a few
          errors.forEach(error => toast({ 
            title: "Aviso", 
            description: error,
            variant: "destructive"
          }));
        } else {
          // Show a consolidated error if there are many
          toast({
            title: "Problemas ao carregar dados",
            description: "Alguns dados podem estar incompletos ou desatualizados",
            variant: "destructive"
          });
        }
      }

      // Update the state with all data we were able to fetch
      setData({
        teamMembers: results.teamMembers || [],
        services: results.services || [],
        insurancePlans: results.insurancePlans || [],
        timeSlots: results.timeSlots || [],
        appointments: results.appointments || [],
        isLoading: false,
        error: errors.length > 0 ? errors.join("; ") : null
      });

    } catch (error) {
      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        console.error("Critical error in useOptimizedQueries:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: `Falha ao buscar dados necessários: ${errorMessage}`
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
