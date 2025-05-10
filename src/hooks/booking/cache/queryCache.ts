
/**
 * In-memory cache implementation for query results
 */

// Default cache TTL in milliseconds (5 minutes)
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// Simple cache store
class Cache {
  private store: Map<string, CacheEntry<any>>;
  
  constructor() {
    this.store = new Map();
  }
  
  // Get item from cache
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  // Set item in cache with TTL
  set<T>(key: string, data: T, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { data, expiry });
  }
  
  // Remove item from cache
  remove(key: string): void {
    this.store.delete(key);
  }
  
  // Clear the entire cache or by prefix
  clear(prefix?: string): void {
    if (prefix) {
      Array.from(this.store.keys())
        .filter(key => key.startsWith(prefix))
        .forEach(key => this.store.delete(key));
    } else {
      this.store.clear();
    }
  }
  
  // Get all keys
  keys(): string[] {
    return Array.from(this.store.keys());
  }
  
  // Check if cache has key
  has(key: string): boolean {
    return this.store.has(key);
  }
  
  // Get cache size
  get size(): number {
    return this.store.size;
  }

  // Invalidate a specific cache entry
  invalidate(key: string): void {
    this.remove(key);
  }
}

// Export singleton cache instance
export const QueryCache = new Cache();

// Helper function to generate consistent cache keys
export const generateCacheKey = (type: string, professionalId: string): string => {
  return `${type}:${professionalId}`;
};
