/**
 * API layer for fetching different types of data
 */

import { supabase } from '@/integrations/supabase/client';
import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL } from '../cache/queryCache';

// Maximum number of retries
const MAX_RETRIES = 2; // Reduced from 3 to 2

// Global concurrency control
const CONCURRENT_REQUESTS_LIMIT = 2;
let activeRequests = 0;
const requestQueue: Array<() => Promise<any>> = [];

// Process queue function to manage concurrent requests
const processQueue = async () => {
  if (activeRequests >= CONCURRENT_REQUESTS_LIMIT || requestQueue.length === 0) {
    return;
  }
  
  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    activeRequests++;
    try {
      await nextRequest();
    } catch (error) {
      console.error("Error processing queued request:", error);
    } finally {
      activeRequests--;
      // Process next item in queue
      processQueue();
    }
  }
};

// Add request to queue
const queueRequest = <T>(request: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const wrappedRequest = async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    requestQueue.push(wrappedRequest);
    processQueue();
  });
};

// Storage based cache with fallbacks
const StorageCache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`booking_cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() < parsed.expiry) {
          return parsed.data;
        } else {
          localStorage.removeItem(`booking_cache_${key}`);
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage cache:", error);
    }
    return null;
  },
  
  set: <T>(key: string, data: T, ttlMs: number): void => {
    try {
      const item = {
        data,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(`booking_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error("Error writing to localStorage cache:", error);
    }
  }
};

type FetchDataOptions = {
  type: string;
  professionalId: string;
  ttl?: number;
  signal?: AbortSignal;
  priority?: 'high' | 'medium' | 'low';
  useStorageCache?: boolean;
  skipQueue?: boolean;
}

/**
 * Generic data fetching function with caching and retry logic
 */
export const fetchData = async <T>(
  options: FetchDataOptions,
  queryFn: () => Promise<any>
): Promise<T[]> => {
  const { 
    type, 
    professionalId, 
    ttl = DEFAULT_CACHE_TTL, // This now uses the imported constant
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
        
        // Implement exponential backoff for retries
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 500; // Reduced from 1000ms to 500ms
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
        
        throw response.error;
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
      throw error;
    }
  };
  
  // Start the fetching process
  const fetchProcess = () => executeFetch();
  
  // Use queue system or direct execution based on priority and config
  if (!skipQueue) {
    return queueRequest<T[]>(fetchProcess);
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
    skipQueue: true // Don't queue team members, they're essential
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
    skipQueue: true // Don't queue services, they're essential
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
    priority: 'medium'
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
    priority: 'medium'
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

// Function to pre-warm cache for essential data
export const prewarmBookingDataCache = async (professionalId: string) => {
  if (!professionalId) return;
  
  const controller = new AbortController();
  const signal = controller.signal;
  
  try {
    console.log("Pre-warming booking data cache");
    
    // Fetch critical data first in parallel
    await Promise.all([
      fetchTeamMembers(professionalId, signal),
      fetchServices(professionalId, signal)
    ]);
    
    // Then fetch non-critical data sequentially
    await fetchTimeSlots(professionalId, signal);
    await fetchInsurancePlans(professionalId, signal);
    await fetchAppointments(professionalId, signal);
    
    console.log("Cache pre-warming complete");
  } catch (error) {
    console.error("Error pre-warming cache:", error);
  }
};
