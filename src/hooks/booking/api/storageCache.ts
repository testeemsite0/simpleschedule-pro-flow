
// Storage based cache with fallbacks
export const StorageCache = {
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
