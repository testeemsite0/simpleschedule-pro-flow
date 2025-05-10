
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

// Create a simple in-memory cache
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

// Default TTL (time to live) for cached data in milliseconds
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Utility function to generate cache keys
const generateCacheKey = (type: string, professionalId: string): string => `${type}:${professionalId}`;

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

  // Use refs for tracking ongoing requests to prevent duplicate calls
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track retry counts to implement exponential backoff
  const retryCountsRef = useRef<Record<string, number>>({
    teamMembers: 0,
    services: 0,
    insurancePlans: 0,
    timeSlots: 0,
    appointments: 0
  });
  
  // Maximum number of retries
  const MAX_RETRIES = 3;
  
  const { toast } = useToast();

  // Helper function to get data with caching
  const fetchWithCache = useCallback(async <T,>(
    type: string,
    queryFn: () => Promise<any>,
    ttl = DEFAULT_CACHE_TTL
  ): Promise<T[]> => {
    if (!professionalId) return [];
    
    const cacheKey = generateCacheKey(type, professionalId);
    
    // Check if we already have a pending request for this data
    if (pendingRequestsRef.current.has(cacheKey)) {
      console.log(`Using pending request for ${type}`);
      try {
        return await pendingRequestsRef.current.get(cacheKey)!;
      } catch (error) {
        // If the pending request fails, we'll continue below to retry
        console.error(`Pending request for ${type} failed:`, error);
      }
    }
    
    // Check cache first
    const cachedData = queryCache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < cachedData.ttl) {
      console.log(`Using cached data for ${type}`);
      return cachedData.data;
    }
    
    // Create a new promise for this request
    const fetchPromise = new Promise<T[]>(async (resolve, reject) => {
      try {
        console.log(`Fetching ${type} for professional:`, professionalId);
        // Execute the query function - note that we need to await it here
        const query = queryFn();
        const response = await query;
        
        if (response.error) {
          console.error(`Error fetching ${type}:`, response.error);
          
          // Track retries with exponential backoff
          if (retryCountsRef.current[type] < MAX_RETRIES) {
            const delay = Math.pow(2, retryCountsRef.current[type]) * 1000;
            console.log(`Retrying ${type} in ${delay}ms (attempt ${retryCountsRef.current[type] + 1})`);
            
            retryCountsRef.current[type]++;
            setTimeout(() => {
              // Clear pending request reference so we can retry
              pendingRequestsRef.current.delete(cacheKey);
              // Retry the fetch
              fetchWithCache(type, queryFn, ttl)
                .then(resolve)
                .catch(reject);
            }, delay);
            return;
          }
          
          throw response.error;
        }
        
        // Reset retry count on success
        retryCountsRef.current[type] = 0;
        
        const resultData = response.data || [];
        
        // Cache the result
        queryCache.set(cacheKey, {
          data: resultData,
          timestamp: Date.now(),
          ttl
        });
        
        console.log(`${type} fetched successfully:`, resultData.length);
        resolve(resultData);
      } catch (error) {
        console.error(`Error in fetchWithCache for ${type}:`, error);
        reject(error);
      } finally {
        // Remove this promise from pending requests
        pendingRequestsRef.current.delete(cacheKey);
      }
    });
    
    // Store the promise in pending requests
    pendingRequestsRef.current.set(cacheKey, fetchPromise);
    
    return fetchPromise;
  }, [professionalId]);

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
      
      // Helper function to check if request has been aborted
      const checkAborted = () => {
        if (signal.aborted) {
          throw new Error("Request aborted");
        }
      };

      // Fetch all data types in parallel with proper error handling
      const [
        teamMembersResult,
        servicesResult,
        insurancePlansResult,
        timeSlotsResult,
        appointmentsResult
      ] = await Promise.allSettled([
        fetchWithCache<any>('teamMembers', () => {
          checkAborted();
          return supabase
            .from('team_members')
            .select('*')
            .eq('professional_id', professionalId)
            .eq('active', true);
        }),
        
        fetchWithCache<any>('services', () => {
          checkAborted();
          return supabase
            .from('services')
            .select('*')
            .eq('professional_id', professionalId)
            .eq('active', true);
        }),
        
        fetchWithCache<any>('insurancePlans', () => {
          checkAborted();
          return supabase
            .from('insurance_plans')
            .select('*')
            .eq('professional_id', professionalId);
        }),
        
        fetchWithCache<any>('timeSlots', () => {
          checkAborted();
          return supabase
            .from('time_slots')
            .select('*')
            .eq('professional_id', professionalId);
        }),
        
        fetchWithCache<any>('appointments', () => {
          checkAborted();
          return supabase
            .from('appointments')
            .select('*')
            .eq('professional_id', professionalId)
            .order('date', { ascending: true });
        })
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
  }, [professionalId, fetchWithCache, toast]);

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
        queryCache.delete(generateCacheKey(type, professionalId));
      });
    }
    
    // Reset retry counts
    Object.keys(retryCountsRef.current).forEach(key => {
      retryCountsRef.current[key as keyof typeof retryCountsRef.current] = 0;
    });
    
    setData(prev => ({ ...prev, isLoading: true }));
    fetchAllData();
  }, [professionalId, fetchAllData]);

  // Add a function to invalidate specific cache entries
  const invalidateCache = useCallback((type?: string) => {
    if (!professionalId) return;
    
    if (type) {
      // Invalidate specific data type
      queryCache.delete(generateCacheKey(type, professionalId));
    } else {
      // Invalidate all data types for this professional
      ['teamMembers', 'services', 'insurancePlans', 'timeSlots', 'appointments'].forEach(t => {
        queryCache.delete(generateCacheKey(t, professionalId));
      });
    }
  }, [professionalId]);

  return {
    ...data,
    refetch,
    invalidateCache
  };
};
