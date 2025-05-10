
/**
 * API layer for fetching different types of data
 */

import { supabase } from '@/integrations/supabase/client';
import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL } from '../cache/queryCache';

// Maximum number of retries
const MAX_RETRIES = 3;

type FetchDataOptions = {
  type: string;
  professionalId: string;
  ttl?: number;
  signal?: AbortSignal;
}

/**
 * Generic data fetching function with caching and retry logic
 */
export const fetchData = async <T>(
  options: FetchDataOptions,
  queryFn: () => Promise<any>
): Promise<T[]> => {
  const { type, professionalId, ttl = DEFAULT_CACHE_TTL, signal } = options;
  
  // Return empty array if no professionalId
  if (!professionalId) return [] as T[];
  
  // Check if the request was aborted
  if (signal?.aborted) {
    console.log(`Request for ${type} was aborted`);
    return [] as T[];
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(type, professionalId);
  
  // Check cache first
  const cachedData = QueryCache.get<T[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Utility function to track retries
  const fetchWithRetry = async (retryCount = 0): Promise<T[]> => {
    try {
      console.log(`Fetching ${type} for professional: ${professionalId} (attempt: ${retryCount + 1})`);
      
      // Check if the request was aborted
      if (signal?.aborted) {
        console.log(`Request for ${type} was aborted during retry`);
        return [] as T[];
      }
      
      // Execute the query function
      const response = await queryFn();
      
      if (response.error) {
        console.error(`Error fetching ${type}:`, response.error);
        
        // Implement exponential backoff for retries
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying ${type} in ${delay}ms (attempt ${retryCount + 1})`);
          
          // Wait and retry
          return new Promise(resolve => {
            setTimeout(() => {
              // Only retry if not aborted
              if (!signal?.aborted) {
                resolve(fetchWithRetry(retryCount + 1));
              } else {
                resolve([] as T[]);
              }
            }, delay);
          });
        }
        
        throw response.error;
      }
      
      const resultData = response.data || [];
      
      // Cache the successful result
      QueryCache.set(cacheKey, resultData, ttl);
      
      console.log(`${type} fetched successfully:`, resultData.length);
      return resultData as T[];
    } catch (error) {
      if (signal?.aborted) {
        console.log(`Request for ${type} was aborted during error handling`);
        return [] as T[];
      }
      
      console.error(`Error in fetchData for ${type}:`, error);
      throw error;
    }
  };
  
  // Start the fetching process
  return fetchWithRetry();
};

/**
 * Fetch team members
 */
export const fetchTeamMembers = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'teamMembers',
    professionalId,
    signal
  }, async () => {
    return await supabase
      .from('team_members')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('active', true);
  });

/**
 * Fetch services
 */
export const fetchServices = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'services',
    professionalId,
    signal
  }, async () => {
    return await supabase
      .from('services')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('active', true);
  });

/**
 * Fetch insurance plans
 */
export const fetchInsurancePlans = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'insurancePlans',
    professionalId,
    signal
  }, async () => {
    return await supabase
      .from('insurance_plans')
      .select('*')
      .eq('professional_id', professionalId);
  });

/**
 * Fetch time slots
 */
export const fetchTimeSlots = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'timeSlots',
    professionalId,
    signal
  }, async () => {
    return await supabase
      .from('time_slots')
      .select('*')
      .eq('professional_id', professionalId);
  });

/**
 * Fetch appointments
 */
export const fetchAppointments = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'appointments',
    professionalId,
    signal
  }, async () => {
    return await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)
      .order('date', { ascending: true });
  });
