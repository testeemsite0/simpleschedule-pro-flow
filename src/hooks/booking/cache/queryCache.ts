
/**
 * Simple cache implementation for query results
 */

// Default TTL (Time To Live) for cache entries - 5 minutes
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

type CacheEntry = {
  data: any;
  timestamp: number;
  expiry: number;
};

class Cache {
  private cache: Record<string, CacheEntry> = {};
  private readonly defaultTTL = DEFAULT_CACHE_TTL; // Use the exported constant

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
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
      expiry
    };
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
      if (this.cache[key].expiry < now) {
        this.delete(key);
      }
    });
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
