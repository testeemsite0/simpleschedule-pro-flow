
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseDataLoadingStateProps {
  initialLoading?: boolean;
  showToast?: boolean;
  maxRetries?: number;
  loadingTimeout?: number; // in ms
}

export const useDataLoadingState = ({ 
  initialLoading = true, 
  showToast = true,
  maxRetries = 3,
  loadingTimeout = 30000 // 30 seconds default timeout
}: UseDataLoadingStateProps = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [dataError, setDataError] = useState<string | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const requestCacheRef = useRef<Map<string, {timestamp: number, data: any}>>(new Map());
  const CACHE_TTL = 60000; // 1 minute cache TTL
  
  // Prevent excessive loading state changes with debounce
  const safeSetLoading = useCallback((loading: boolean) => {
    // Clear any existing timeout to prevent race conditions
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Only update if the state is actually changing
    setIsLoading(prevLoading => {
      if (prevLoading !== loading) {
        return loading;
      }
      return prevLoading;
    });
    
    // Add a safety timeout to ensure loading doesn't get stuck
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        if (showToast) {
          toast.error("A operação está demorando mais que o esperado");
        }
        setDataError("Tempo limite excedido. Tente novamente mais tarde.");
      }, loadingTimeout);
    }
  }, [showToast, loadingTimeout]);
  
  // Simple request caching to avoid redundant requests
  const getCachedData = useCallback(<T,>(cacheKey: string): T | null => {
    const cached = requestCacheRef.current.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`Using cached data for: ${cacheKey}`);
      return cached.data as T;
    }
    return null;
  }, []);
  
  const setCachedData = useCallback(<T,>(cacheKey: string, data: T): void => {
    requestCacheRef.current.set(cacheKey, {
      timestamp: Date.now(),
      data
    });
    console.log(`Cached data for: ${cacheKey}`);
  }, []);
  
  // Enhanced error handling with retry capability
  const handleError = useCallback((errorMessage: string, errorObject?: any, cacheKey?: string) => {
    console.error(`Error in data loading: ${errorMessage}`, errorObject);
    
    // Check if the error is related to API rate limits or insufficient resources
    const isResourceError = errorObject && 
      (errorObject.message?.includes('ERR_INSUFFICIENT_RESOURCES') || 
       errorObject.code === 429 ||
       errorObject.error?.code === 429);
    
    if (isResourceError && retryCountRef.current < maxRetries) {
      // Implement exponential backoff for retries
      const retryDelay = Math.min(1000 * (2 ** retryCountRef.current), 10000);
      retryCountRef.current += 1;
      
      console.log(`Retrying request in ${retryDelay}ms (attempt ${retryCountRef.current} of ${maxRetries})`);
      
      if (showToast && retryCountRef.current > 1) {
        toast.warning(`Reconnecting... (attempt ${retryCountRef.current} of ${maxRetries})`);
      }
      
      // Don't set error or change loading state for retry attempts
      return {
        shouldRetry: true,
        retryDelay
      };
    }
    
    // Reset retry counter and set error for non-retriable errors or max retries reached
    retryCountRef.current = 0;
    setDataError(errorMessage);
    
    if (showToast) {
      toast.error("Erro ao carregar dados para agendamento");
    }
    
    // Make sure loading is set to false to prevent UI from hanging
    safeSetLoading(false);
    
    return {
      shouldRetry: false,
      retryDelay: 0
    };
  }, [showToast, maxRetries, safeSetLoading]);
  
  const clearError = useCallback(() => {
    if (dataError !== null) {
      setDataError(null);
    }
  }, [dataError]);
  
  // Reset retry counter
  const resetRetryCount = useCallback(() => {
    retryCountRef.current = 0;
  }, []);
  
  // Clean up any timeouts when component unmounts
  const cleanup = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);
  
  return {
    isLoading,
    setIsLoading: safeSetLoading,
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
