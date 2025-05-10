
/**
 * Simple cache implementation for professional data
 */

import { Professional } from '@/types';

// Cache type definition
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Default TTL (time to live) for cached data in milliseconds
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// The cache instance
const professionalCache = new Map<string, CacheEntry<Professional>>();

/**
 * Cache utility functions
 */
export const ProfessionalCache = {
  /**
   * Check if data for a slug exists in cache and is still valid
   */
  get: (slug: string): Professional | null => {
    const cached = professionalCache.get(slug);
    if (cached && (Date.now() - cached.timestamp) < DEFAULT_CACHE_TTL) {
      console.log("Using cached professional data for:", slug);
      return cached.data;
    }
    return null;
  },

  /**
   * Store professional data in cache
   */
  set: (slug: string, data: Professional): void => {
    professionalCache.set(slug, {
      data,
      timestamp: Date.now()
    });
  },

  /**
   * Clear a specific cache entry or all entries
   */
  invalidate: (slug?: string): void => {
    if (slug) {
      professionalCache.delete(slug);
    } else {
      professionalCache.clear();
    }
  }
};
