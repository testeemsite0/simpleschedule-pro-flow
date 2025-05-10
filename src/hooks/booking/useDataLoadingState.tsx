
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseDataLoadingStateProps {
  initialLoading?: boolean;
  initialError?: string | null;
  loadingTimeout?: number;
  showToast?: boolean;
  maxRetries?: number;
}

export const useDataLoadingState = ({
  initialLoading = false,
  initialError = null,
  loadingTimeout = 10000,
  showToast = true,
  maxRetries = 3
}: UseDataLoadingStateProps = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [dataError, setDataError] = useState<string | null>(initialError);
  const retryCount = useRef(0);
  const loadingTimeoutId = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  // Cache mechanism
  const cachedData = useRef<Map<string, any>>(new Map());
  
  // Helpers for cache
  const getCachedData = <T,>(key: string): T | null => {
    return (cachedData.current.get(key) as T) || null;
  };
  
  const setCachedData = <T,>(key: string, data: T): void => {
    cachedData.current.set(key, data);
  };
  
  // Error handling with context info
  const handleError = useCallback((context: string, error: any) => {
    if (!isMountedRef.current) return;
    
    const errorMessage = error?.message || 'Unknown error occurred';
    const contextualError = `Error in ${context}: ${errorMessage}`;
    
    console.error(contextualError, error);
    setDataError(contextualError);
    
    if (showToast) {
      toast.error(`Error loading data: ${errorMessage}`);
    }
    
    // Retry mechanism
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`Retry attempt ${retryCount.current} of ${maxRetries}`);
    }
  }, [showToast, maxRetries]);
  
  // Clear error state
  const clearError = useCallback(() => {
    setDataError(null);
  }, []);
  
  // Reset retry counter
  const resetRetryCount = useCallback(() => {
    retryCount.current = 0;
  }, []);
  
  // Loading timeout detection
  useEffect(() => {
    if (isLoading && loadingTimeout > 0) {
      loadingTimeoutId.current = window.setTimeout(() => {
        if (isMountedRef.current && isLoading) {
          console.warn(`Loading timeout after ${loadingTimeout}ms`);
          
          if (showToast) {
            toast.warning("Loading data is taking longer than expected.");
          }
        }
      }, loadingTimeout);
    } else if (loadingTimeoutId.current !== null) {
      clearTimeout(loadingTimeoutId.current);
      loadingTimeoutId.current = null;
    }
    
    return () => {
      if (loadingTimeoutId.current !== null) {
        clearTimeout(loadingTimeoutId.current);
        loadingTimeoutId.current = null;
      }
    };
  }, [isLoading, loadingTimeout, showToast]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    if (loadingTimeoutId.current !== null) {
      clearTimeout(loadingTimeoutId.current);
      loadingTimeoutId.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  return {
    isLoading,
    setIsLoading,
    dataError,
    setDataError,
    handleError,
    clearError,
    resetRetryCount,
    getCachedData,
    setCachedData,
    cleanup
  };
};
