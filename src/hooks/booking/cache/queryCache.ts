
/**
 * Advanced cache implementation with optimized performance
 */

// Increased TTL (Time To Live) to reduce frequency of requests
export const DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes (was 5 minutes)

// Add a debounce interval to prevent excessive fetches
export const FETCH_DEBOUNCE_MS = 2000; // 2 seconds minimum between identical requests

type CacheEntry = {
  data: any;
  timestamp: number;
  expiry: number;
  stale: boolean; // Track if data is stale but usable
};

// Track in-flight requests to prevent duplicates
const pendingRequests: Record<string, Promise<any>> = {};

class Cache {
  private cache: Record<string, CacheEntry> = {};
  private readonly defaultTTL = DEFAULT_CACHE_TTL;
  private isPurgeScheduled = false;

  /**
   * Get data from cache with stale-while-revalidate support
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) return null;
    
    // If data is expired but marked as stale, we can still use it
    // while a refresh happens in the background
    if (Date.now() > entry.expiry) {
      if (!entry.stale) {
        this.delete(key);
        return null;
      }
      // Data is stale but still usable temporarily
      console.log(`Using stale cache data for ${key} while refreshing`);
    }
    
    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    const expiry = timestamp + ttl;
    
    this.cache[key] = {
      data,
      timestamp,
      expiry,
      stale: false
    };
    
    // Schedule periodic cache cleanup if not already scheduled
    if (!this.isPurgeScheduled) {
      this.schedulePurge();
    }
  }

  /**
   * Mark data as stale but still usable
   */
  markAsStale(key: string): boolean {
    if (this.has(key)) {
      this.cache[key].stale = true;
      
      // Extend expiry to allow stale data to be used for a short time
      this.cache[key].expiry = Date.now() + (5 * 60 * 1000); // 5 more minutes for stale data
      return true;
    }
    return false;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    if (this.has(key)) {
      delete this.cache[key];
      return true;
    }
    return false;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return key in this.cache;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): boolean {
    return this.delete(key);
  }

  /**
   * Purge all expired entries
   */
  purgeExpired(): void {
    const now = Date.now();
    
    Object.keys(this.cache).forEach(key => {
      // Only delete entries that are expired and not marked as stale
      if (this.cache[key].expiry < now && !this.cache[key].stale) {
        this.delete(key);
      }
    });
  }

  /**
   * Schedule periodic cache cleanup
   */
  private schedulePurge(): void {
    this.isPurgeScheduled = true;
    
    setTimeout(() => {
      this.purgeExpired();
      this.isPurgeScheduled = false;
      
      // Reschedule if there are still items in the cache
      if (Object.keys(this.cache).length > 0) {
        this.schedulePurge();
      }
    }, 60000); // Run cleanup every minute
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache = {};
  }
}

// Singleton instance for application-wide cache
export const QueryCache = new Cache();

/**
 * Generate a consistent cache key for a data type and professional
 */
export function generateCacheKey(type: string, professionalId: string): string {
  return `${professionalId}:${type}`;
}

/**
 * Track in-flight requests to prevent duplicates
 */
export function trackRequest<T>(key: string, promise: Promise<T>): Promise<T> {
  pendingRequests[key] = promise;
  
  // Remove from pending when complete
  return promise.finally(() => {
    delete pendingRequests[key];
  });
}

/**
 * Check if a request for the given key is already in progress
 */
export function isRequestPending(key: string): Promise<any> | null {
  return pendingRequests[key] || null;
}
