/**
 * API layer for fetching different types of data
 */

import { supabase } from '@/integrations/supabase/client';
import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL } from '../cache/queryCache';
import { queueRequest } from './requestQueue';
import { StorageCache } from './storageCache';
import { MAX_RETRIES } from './constants';

/**
 * Generic data fetching function with caching and retry logic
 */
export const fetchData = async <T>(
  options: import('./types').FetchDataOptions,
  queryFn: () => Promise<any>
): Promise<T[]> => {
  const { 
    type, 
    professionalId, 
    ttl = DEFAULT_CACHE_TTL, 
    signal,
    priority = 'medium',
    useStorageCache = true,
    skipQueue = false
  } = options;
  
  // Return empty array if no professionalId
  if (!professionalId) return [] as T[];
  
  // Check if the request was aborted
  if (signal?.aborted) {
    console.log(`Request for ${type} was aborted`);
    return [] as T[];
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(type, professionalId);
  
  // Check in-memory cache first
  const cachedData = QueryCache.get<T[]>(cacheKey);
  if (cachedData) {
    console.log(`Using in-memory cache for ${type}`);
    return cachedData;
  }
  
  // Check localStorage cache if in-memory cache missed
  if (useStorageCache) {
    const storedData = StorageCache.get<T[]>(cacheKey);
    if (storedData) {
      // Still store in memory cache for faster access
      QueryCache.set(cacheKey, storedData, ttl);
      console.log(`Using localStorage cache for ${type}`);
      return storedData;
    }
  }
  
  // Utility function for fetch execution with retries
  const executeFetch = async (retryCount = 0): Promise<T[]> => {
    try {
      console.log(`Fetching ${type} for professional: ${professionalId} (attempt: ${retryCount + 1})`);
      
      if (signal?.aborted) {
        console.log(`Request for ${type} was aborted during retry`);
        return [] as T[];
      }
      
      // Execute the query function
      const response = await queryFn();
      
      if (response.error) {
        console.error(`Error fetching ${type}:`, response.error);
        
        // Implement exponential backoff for retries with decreased delays
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 300; // Reduced from 500ms to 300ms 
          console.log(`Retrying ${type} in ${delay}ms (attempt ${retryCount + 1})`);
          
          // Wait and retry
          return new Promise(resolve => {
            setTimeout(() => {
              // Only retry if not aborted
              if (!signal?.aborted) {
                resolve(executeFetch(retryCount + 1));
              } else {
                resolve([] as T[]);
              }
            }, delay);
          });
        }
        
        // Return empty array instead of throwing to prevent cascading failures
        console.warn(`Failed to fetch ${type} after ${retryCount + 1} attempts. Returning empty array.`);
        return [] as T[];
      }
      
      const resultData = response.data || [];
      
      // Cache the successful result in memory
      QueryCache.set(cacheKey, resultData, ttl);
      
      // Also cache in localStorage for persistent storage
      if (useStorageCache) {
        StorageCache.set(cacheKey, resultData, ttl * 2); // Use double TTL for localStorage
      }
      
      console.log(`${type} fetched successfully:`, resultData.length);
      return resultData as T[];
    } catch (error) {
      if (signal?.aborted) {
        console.log(`Request for ${type} was aborted during error handling`);
        return [] as T[];
      }
      
      console.error(`Error in fetchData for ${type}:`, error);
      // Return empty array instead of throwing
      return [] as T[];
    }
  };
  
  // Start the fetching process
  const fetchProcess = () => executeFetch();
  
  // Use queue system or direct execution based on priority and config
  if (!skipQueue) {
    return queueRequest<T[]>(fetchProcess, priority);
  } else {
    return fetchProcess();
  }
};

/**
 * Fetch team members - high priority, essential data
 */
export const fetchTeamMembers = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'teamMembers',
    professionalId,
    signal,
    priority: 'high',
    skipQueue: true, // Don't queue team members, they're essential
    ttl: DEFAULT_CACHE_TTL * 2 // Cache team members for longer
  }, async () => {
    return await supabase
      .from('team_members')
      .select('id, name, position, active')
      .eq('professional_id', professionalId)
      .eq('active', true);
  });

/**
 * Fetch services - high priority data
 */
export const fetchServices = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'services',
    professionalId,
    signal,
    priority: 'high',
    skipQueue: true, // Don't queue services, they're essential
    ttl: DEFAULT_CACHE_TTL * 2 // Cache services for longer
  }, async () => {
    return await supabase
      .from('services')
      .select('id, name, duration_minutes, price, active')
      .eq('professional_id', professionalId)
      .eq('active', true);
  });

/**
 * Fetch insurance plans - medium priority
 */
export const fetchInsurancePlans = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'insurancePlans',
    professionalId,
    signal,
    priority: 'medium',
    ttl: DEFAULT_CACHE_TTL * 1.5 // Cache insurance plans for longer
  }, async () => {
    return await supabase
      .from('insurance_plans')
      .select('id, name, current_appointments, limit_per_plan')
      .eq('professional_id', professionalId);
  });

/**
 * Fetch time slots - medium priority
 */
export const fetchTimeSlots = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'timeSlots',
    professionalId,
    signal,
    priority: 'medium',
    ttl: DEFAULT_CACHE_TTL * 1.5 // Cache time slots for longer
  }, async () => {
    return await supabase
      .from('time_slots')
      .select('id, day_of_week, start_time, end_time, team_member_id, available, appointment_duration_minutes, lunch_break_start, lunch_break_end')
      .eq('professional_id', professionalId);
  });

/**
 * Fetch appointments - lowest priority
 */
export const fetchAppointments = (professionalId: string, signal?: AbortSignal) => 
  fetchData({
    type: 'appointments',
    professionalId,
    signal,
    priority: 'low'
  }, async () => {
    // Filter to only get current and future appointments to reduce data size
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return await supabase
      .from('appointments')
      .select('id, date, start_time, end_time, team_member_id, status')
      .eq('professional_id', professionalId)
      .gte('date', formattedDate) // Only get current and future appointments
      .order('date', { ascending: true });
  });

// Function to pre-warm cache for essential data with improved performance
export const prewarmBookingDataCache = async (professionalId: string) => {
  if (!professionalId) return;
  
  const controller = new AbortController();
  const signal = controller.signal;
  
  try {
    console.log("Pre-warming booking data cache");
    
    // Fetch critical data first in parallel with immediate execution
    await Promise.all([
      fetchTeamMembers(professionalId, signal),
      fetchServices(professionalId, signal)
    ]);
    
    // Then fetch non-critical data in parallel but with lower priority
    Promise.all([
      fetchTimeSlots(professionalId, signal),
      fetchInsurancePlans(professionalId, signal),
      fetchAppointments(professionalId, signal)
    ]).catch(e => console.warn("Non-critical data pre-warming had errors:", e));
    
    console.log("Cache pre-warming complete for critical data");
  } catch (error) {
    console.error("Error pre-warming cache:", error);
  }
};
