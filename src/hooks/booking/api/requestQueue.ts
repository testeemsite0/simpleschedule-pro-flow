import { CONCURRENT_REQUESTS_LIMIT, MAX_RETRIES, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_REQUESTS } from './constants';

// Global concurrency control
let activeRequests = 0;
const requestQueue: Array<() => Promise<any>> = [];

// Rate limiting settings
let requestsInWindow = 0;
let windowStartTime = Date.now();

// Reset rate limiting window
const resetRateLimitingWindow = () => {
  requestsInWindow = 0;
  windowStartTime = Date.now();
};

// Check if we can make a new request within rate limits
const canMakeRequest = (): boolean => {
  const now = Date.now();
  
  // Reset window if needed
  if (now - windowStartTime > RATE_LIMIT_WINDOW) {
    resetRateLimitingWindow();
    return true;
  }
  
  return requestsInWindow < RATE_LIMIT_MAX_REQUESTS;
};

// Process queue function to manage concurrent requests
const processQueue = async () => {
  if (activeRequests >= CONCURRENT_REQUESTS_LIMIT || requestQueue.length === 0) {
    return;
  }
  
  // Check rate limiting
  if (!canMakeRequest()) {
    // If we're rate limited, wait until the window resets
    const timeToWait = RATE_LIMIT_WINDOW - (Date.now() - windowStartTime) + 50;
    console.log(`Rate limited, waiting for ${timeToWait}ms before processing next request`);
    setTimeout(processQueue, timeToWait);
    return;
  }
  
  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    activeRequests++;
    requestsInWindow++;
    try {
      await nextRequest();
    } catch (error) {
      console.error("Error processing queued request:", error);
    } finally {
      activeRequests--;
      // Process next item in queue
      setTimeout(processQueue, 50); // Add small delay between requests
    }
  }
};

// Add request to queue
export const queueRequest = <T>(request: () => Promise<T>, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<T> => {
  return new Promise((resolve, reject) => {
    const wrappedRequest = async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    if (priority === 'high') {
      // High priority goes to the front of the queue
      requestQueue.unshift(wrappedRequest);
    } else {
      // Others go to the back
      requestQueue.push(wrappedRequest);
    }
    
    processQueue();
  });
};
