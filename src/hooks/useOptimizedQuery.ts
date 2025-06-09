
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const queryCache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutos
  cacheTime = 10 * 60 * 1000, // 10 minutos
  enabled = true
}: UseOptimizedQueryOptions<T>): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = queryKey.join('-');

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Verificar cache
    const cached = queryCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      // Salvar no cache
      queryCache.set(cacheKey, {
        data: result,
        timestamp: now
      });

      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryKey, queryFn, enabled, staleTime, cacheKey]);

  const refetch = useCallback(async () => {
    // Limpar cache ao fazer refetch manual
    queryCache.delete(cacheKey);
    await fetchData();
  }, [fetchData, cacheKey]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Limpar cache expirado
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of queryCache.entries()) {
        if (now - value.timestamp > cacheTime) {
          queryCache.delete(key);
        }
      }
    }, cacheTime);

    return () => clearInterval(interval);
  }, [cacheTime]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
