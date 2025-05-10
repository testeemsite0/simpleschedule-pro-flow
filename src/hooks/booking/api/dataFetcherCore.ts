
import { QueryCache, generateCacheKey, DEFAULT_CACHE_TTL, isRequestPending, trackRequest } from '../cache/queryCache';

// Types for data fetching
export type DataType = 'teamMembers' | 'services' | 'insurancePlans' | 'timeSlots' | 'appointments';
export type Priority = 'high' | 'medium' | 'low';

interface FetchDataOptions {
  type: DataType;
  professionalId: string;
  signal?: AbortSignal;
  priority?: Priority;
  skipQueue?: boolean;
  ttl?: number;
}

interface QueryFunctions<T> {
  [key: string]: () => Promise<T>;
}

// Main data fetching utility function with cache handling
export async function fetchData<T>(
  options: FetchDataOptions,
  queryFn: () => Promise<{ data: T; error: any } | T>
): Promise<T> {
  const { type, professionalId, signal, priority = 'medium', skipQueue = false, ttl = DEFAULT_CACHE_TTL } = options;
  
  // Log fetch request
  console.log(`dataFetcherCore: Fetching ${type} for ${professionalId}, priority: ${priority}, skipQueue: ${skipQueue}`);
  
  // Generate unique cache key
  const cacheKey = generateCacheKey(type, professionalId);
  
  // Check if already in cache
  const cachedData = QueryCache.get<T>(cacheKey);
  if (cachedData !== null) {
    console.log(`dataFetcherCore: Cache hit for ${cacheKey}`);
    return cachedData;
  }
  
  // Check if a request is already in progress
  const pendingRequest = isRequestPending(cacheKey);
  if (pendingRequest && !skipQueue) {
    console.log(`dataFetcherCore: Request already in progress for ${cacheKey}, joining pending request`);
    return pendingRequest as Promise<T>;
  }
  
  // Abort handler
  if (signal?.aborted) {
    console.log(`dataFetcherCore: Request for ${cacheKey} was aborted`);
    throw new Error('Request aborted');
  }
  
  // Create fetch promise
  const fetchPromise = async (): Promise<T> => {
    try {
      console.log(`dataFetcherCore: Starting actual fetch for ${cacheKey}`);
      const result = await queryFn();
      
      // Different response formats from queryFn
      let data: T;
      if (result && typeof result === 'object' && 'data' in result) {
        data = result.data;
        if (result.error) {
          console.error(`dataFetcherCore: Error in query response for ${cacheKey}:`, result.error);
          throw result.error;
        }
      } else {
        data = result as T;
      }
      
      // Log the data size/shape
      if (Array.isArray(data)) {
        console.log(`dataFetcherCore: Fetched ${data.length} items for ${cacheKey}`);
      } else {
        console.log(`dataFetcherCore: Fetched data for ${cacheKey}:`, data ? 'data exists' : 'data is null/undefined');
      }
      
      // Cache the result
      QueryCache.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error(`dataFetcherCore: Error fetching ${cacheKey}:`, error);
      
      // Mark as stale but usable in emergency
      QueryCache.markAsStale(cacheKey);
      throw error;
    }
  };
  
  // Track this request to prevent duplications
  return trackRequest(cacheKey, fetchPromise());
}

// Parallel data fetching with dependency resolution
export async function unifiedDataFetch<T>(
  professionalId: string,
  dataTypes: string[],
  queryFns: QueryFunctions<T>,
  signal?: AbortSignal
): Promise<Record<string, T>> {
  console.log(`unifiedDataFetch: Starting unified fetch for ${professionalId}, data types: [${dataTypes.join(', ')}]`);
  
  // Helper function to map type to priority
  const getPriority = (type: string): Priority => {
    if (type === 'teamMembers' || type === 'services') return 'high';
    if (type === 'insurancePlans') return 'medium';
    return 'low';
  };
  
  try {
    // Execute all requests in parallel
    const promises = dataTypes.map(async type => {
      if (!queryFns[type]) {
        console.warn(`unifiedDataFetch: No query function for ${type}`);
        return { type, data: null };
      }
      
      try {
        console.log(`unifiedDataFetch: Starting fetch for ${type}`);
        const data = await queryFns[type]();
        console.log(`unifiedDataFetch: Completed fetch for ${type}`);
        return { type, data };
      } catch (error) {
        console.error(`unifiedDataFetch: Error fetching ${type}:`, error);
        return { type, data: null, error };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Convert results to record
    const resultRecord: Record<string, T> = {};
    results.forEach(({ type, data }) => {
      resultRecord[type] = data;
    });
    
    console.log(`unifiedDataFetch: All data fetched for ${professionalId}`);
    return resultRecord;
  } catch (error) {
    console.error(`unifiedDataFetch: Critical error in unified fetch for ${professionalId}:`, error);
    throw error;
  }
}
