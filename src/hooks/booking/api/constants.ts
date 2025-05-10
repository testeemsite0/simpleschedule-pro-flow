
// Maximum number of retries for failed requests
export const MAX_RETRIES = 2;

// Concurrent request limit (reduced from previous value)
export const CONCURRENT_REQUESTS_LIMIT = 2;

// Rate limiting settings (more conservative)
export const RATE_LIMIT_WINDOW = 30000; // 30 seconds (was 10 seconds)
export const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per window (was 10)

// Minimum interval between refreshes (ms)
export const MIN_REFRESH_INTERVAL = 60000; // 1 minute

// Optimized batch size for data loading
export const OPTIMAL_BATCH_SIZE = 20;
