
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDataLoadingStateProps {
  showToast?: boolean;
  maxRetries?: number;
  loadingTimeout?: number; // ms
}

interface ErrorState {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useDataLoadingState = ({
  showToast = true,
  maxRetries = 2, // Reduced from 3 to 2
  loadingTimeout = 15000 // Reduced from 45s to 15s
}: UseDataLoadingStateProps = {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const retryCountRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track if this component is still mounted
  const isMountedRef = useRef<boolean>(true);
  
  // Cache for data, to reduce network requests
  const cachedDataRef = useRef<Record<string, any>>({});
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Set up loading timeout
  useEffect(() => {
    if (isLoading && loadingTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setDataError("O tempo para carregamento dos dados expirou. Tente novamente.");
          
          if (showToast) {
            toast.error("O tempo para carregamento dos dados expirou", {
              description: "Por favor, tente novamente mais tarde.",
              duration: 5000,
            });
          }
        }
      }, loadingTimeout);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout, showToast]);
  
  const handleError = useCallback((context: string, error: any) => {
    if (!isMountedRef.current) return;
    
    // Format error info consistently
    let errorInfo: ErrorState;
    if (typeof error === 'string') {
      errorInfo = { message: error };
    } else if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        details: error.stack,
      };
    } else {
      errorInfo = error || { message: 'Unknown error' };
    }
    
    // Log the error with context
    console.error(`Error in data loading: Error loading ${context}:`, errorInfo);
    
    // Only update state and show toast if still mounted and if retry count is within limits
    if (retryCountRef.current >= maxRetries) {
      setDataError(`Erro ao carregar ${context}. Por favor, recarregue a página.`);
      setIsLoading(false);
      
      if (showToast) {
        toast.error(`Erro ao carregar ${context}`, {
          description: "Tente novamente mais tarde. O sistema tentará usar dados em cache.",
          duration: 5000,
        });
      }
    } else {
      // Increment retry count
      retryCountRef.current += 1;
      
      if (showToast && retryCountRef.current === maxRetries) {
        toast.error("Problemas ao carregar os dados", {
          description: "Usando dados em cache. Algumas informações podem estar desatualizadas.",
          duration: 4000,
        });
      }
    }
  }, [maxRetries, showToast]);
  
  const clearError = useCallback(() => {
    if (!isMountedRef.current) return;
    setDataError(null);
  }, []);
  
  const resetRetryCount = useCallback(() => {
    retryCountRef.current = 0;
  }, []);
  
  // Methods to manage cached data
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    return (cachedDataRef.current[key] as T) || null;
  }, []);
  
  const setCachedData = useCallback(<T,>(key: string, data: T): void => {
    cachedDataRef.current[key] = data;
  }, []);

  // Clean up cache and state
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    cachedDataRef.current = {};
    retryCountRef.current = 0;
    setDataError(null);
  }, []);
  
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
