
/**
 * Core data fetching functionality with optimized performance
 */

import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL, isRequestPending, trackRequest } from '../cache/queryCache';
import { queueRequest } from './requestQueue';
import { StorageCache } from './storageCache';
import { MAX_RETRIES } from './constants';
import { FetchDataOptions } from './types';

// Track last request time by type to implement rate limiting
const lastRequestTime: Record<string, number> = {};
const MIN_REQUEST_INTERVAL = 5000; // Minimum 5 seconds between requests of the same type

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
    ttl = DEFAULT_CACHE_TTL, 
    signal,
    priority = 'medium',
    useStorageCache = true,
    skipQueue = false
  } = options;
  
  // Return empty array if no professionalId
  if (!professionalId) {
    console.log(`No professionalId provided for ${type}, returning empty array`);
    return [] as T[];
  }
  
  // Check if the request was aborted
  if (signal?.aborted) {
    console.log(`Request for ${type} was aborted`);
    return [] as T[];
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(type, professionalId);
  
  // Rate limiting check - prevent hammering the same endpoint
  const now = Date.now();
  const lastFetch = lastRequestTime[type] || 0;
  
  if (now - lastFetch < MIN_REQUEST_INTERVAL) {
    console.log(`Rate limiting fetch for ${type}, using cache or waiting`);
    const cachedData = QueryCache.get<T[]>(cacheKey);
    if (cachedData) return cachedData;
  }
  
  // Check if there's already a pending request for this data
  const pendingRequest = isRequestPending(cacheKey);
  if (pendingRequest) {
    console.log(`Reusing in-flight request for ${type}`);
    return pendingRequest as Promise<T[]>;
  }
  
  // Check in-memory cache first
  const cachedData = QueryCache.get<T[]>(cacheKey);
  if (cachedData) {
    console.log(`Using in-memory cache for ${type}`);
    
    // If data is available but getting old, refresh in background
    const cacheEntry = QueryCache.get<any>(cacheKey);
    const cacheAge = now - lastFetch;
    
    if (cacheAge > ttl / 2) {
      console.log(`Cache for ${type} is aging, refreshing in background`);
      QueryCache.markAsStale(cacheKey);
      
      // Non-blocking background refresh
      setTimeout(() => {
        executeFetch().catch(err => {
          console.error(`Background refresh for ${type} failed:`, err);
        });
      }, 100);
    }
    
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
      lastRequestTime[type] = Date.now(); // Update last request time
      
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
      
      // Ensure response.data is always an array
      const resultData = Array.isArray(response.data) ? response.data : [];
      
      console.log(`${type} fetched successfully with ${resultData.length} items`);
      
      // Cache the successful result in memory
      QueryCache.set(cacheKey, resultData, ttl);
      
      // Also cache in localStorage for persistent storage
      if (useStorageCache) {
        StorageCache.set(cacheKey, resultData, ttl * 2); // Use double TTL for localStorage
      }
      
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
  
  // Create a fetch promise and track it to avoid duplicates
  const fetchPromise = executeFetch();
  const trackedPromise = trackRequest(cacheKey, fetchPromise);
  
  // Start the fetching process
  // Use queue system or direct execution based on priority and config
  if (!skipQueue) {
    return queueRequest<T[]>(() => trackedPromise, priority);
  } else {
    return trackedPromise;
  }
};

/**
 * Unified data loader that fetches multiple data types in a single logical operation
 * to avoid redundant requests and unnecessary re-renders
 */
export const unifiedDataFetch = async <T>(
  professionalId: string,
  dataTypes: string[],
  queryFns: Record<string, () => Promise<any>>,
  signal?: AbortSignal
): Promise<Record<string, T[]>> => {
  if (!professionalId) return {} as Record<string, T[]>;
  
  console.log(`Starting unifiedDataFetch for professional ${professionalId} with data types:`, dataTypes);
  
  const results: Record<string, T[]> = {};
  const fetchPromises: Promise<void>[] = [];
  
  // Prepare all requests but execute critical ones first
  for (const type of dataTypes) {
    if (!queryFns[type]) continue;
    
    const cacheKey = generateCacheKey(type, professionalId);
    
    // Check cache first
    const cachedData = QueryCache.get<T[]>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${type}`);
      results[type] = cachedData;
      continue;
    }
    
    // If not in cache, prepare to fetch but don't execute yet
    const fetchPromise = async () => {
      try {
        const isPriority = ['teamMembers', 'services'].includes(type);
        const options: FetchDataOptions = {
          type,
          professionalId,
          signal,
          priority: isPriority ? 'high' : 'medium',
          skipQueue: isPriority
        };
        
        const data = await fetchData<T>(options, queryFns[type]);
        console.log(`Setting ${type} result with ${data.length} items`);
        results[type] = data;
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        results[type] = [] as unknown as T[];
      }
    };
    
    fetchPromises.push(fetchPromise());
  }
  
  // Execute all prepared requests in parallel
  if (fetchPromises.length > 0) {
    await Promise.all(fetchPromises);
  }
  
  console.log("UnifiedDataFetch results summary:", 
    Object.entries(results).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 'not array'} items`).join(', ')
  );
  
  return results;
};
