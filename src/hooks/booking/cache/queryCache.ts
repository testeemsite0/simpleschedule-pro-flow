
/**
 * Simple in-memory cache for query results
 */

// Cache type definition
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

// Default TTL (time to live) for cached data in milliseconds
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// The cache instance
const queryCache = new Map<string, CacheEntry<any>>();

/**
 * Utility function to generate cache keys
 */
export const generateCacheKey = (type: string, professionalId: string): string => 
  `${type}:${professionalId}`;

/**
 * Cache utility functions
 */
export const QueryCache = {
  /**
   * Check if data for a key exists in cache and is still valid
   */
  get: <T>(key: string): T | null => {
    const cached = queryCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log(`Using cached data for ${key}`);
      return cached.data as T;
    }
    return null;
  },

  /**
   * Store data in cache
   */
  set: <T>(key: string, data: T, ttl = DEFAULT_CACHE_TTL): void => {
    queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },

  /**
   * Clear a specific cache entry or all entries
   */
  invalidate: (key?: string): void => {
    if (key) {
      queryCache.delete(key);
    } else {
      queryCache.clear();
    }
  }
};
