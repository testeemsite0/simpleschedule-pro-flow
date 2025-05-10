
/**
 * Core data fetching functionality
 */

import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL } from '../cache/queryCache';
import { queueRequest } from './requestQueue';
import { StorageCache } from './storageCache';
import { MAX_RETRIES } from './constants';
import { FetchDataOptions } from './types';

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
