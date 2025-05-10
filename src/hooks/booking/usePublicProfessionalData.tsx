
import { useState, useEffect, useCallback, useRef } from 'react';
import { Professional } from '@/types';
import { toast } from 'sonner';
import { fetchProfessionalBySlug } from './api/professionalApi';
import { ProfessionalCache } from './cache/professionalCache';

/**
 * Hook to fetch professional data by slug - used for public booking links
 * With retry mechanism, caching and resource-aware error handling
 */
export const usePublicProfessionalData = (slug: string | undefined) => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const initialRetryDelay = 1000; // 1 second
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const fetchProfessionalData = useCallback(async (signal?: AbortSignal) => {
    if (!slug) {
      setLoading(false);
      setError("Link de agendamento inválido");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Fetching professional data for slug: ${slug} (attempt: ${retryCountRef.current + 1})`);
      
      const result = await fetchProfessionalBySlug(slug, signal);
      
      // If the request was aborted, don't update state
      if (signal?.aborted) {
        return;
      }
      
      if (result.error) {
        // Handle resource error with exponential backoff retry
        if (result.error === 'RESOURCE_ERROR' && retryCountRef.current < maxRetries) {
          const retryDelay = initialRetryDelay * Math.pow(2, retryCountRef.current);
          retryCountRef.current += 1;
          
          console.log(`Resource error. Retrying in ${retryDelay}ms (attempt ${retryCountRef.current} of ${maxRetries})`);
          
          // Don't show toast for first retry
          if (retryCountRef.current > 1) {
            toast.info(`Tentando novamente em ${retryDelay/1000} segundos...`);
          }
          
          // Schedule retry with exponential backoff
          setTimeout(() => {
            if (!signal?.aborted) {
              fetchProfessionalData();
            }
          }, retryDelay);
          
          return;
        }
        
        // Max retries reached or non-resource error
        setError(result.error === 'RESOURCE_ERROR'
          ? "Servidor ocupado. Tente novamente mais tarde."
          : result.error);
        
        setLoading(false);
        
        if (retryCountRef.current >= maxRetries) {
          toast.error("Erro ao carregar dados do profissional após várias tentativas");
        }
        return;
      }
      
      // Success
      setProfessional(result.data);
      setLoading(false);
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (error: any) {
      // If the request was aborted, don't update state or show errors
      if (error.message === 'Request aborted' || signal?.aborted) {
        console.log("Request was aborted, ignoring");
        return;
      }
      
      console.error("Unexpected error fetching professional data:", error);
      
      setError(`Erro ao carregar dados do profissional: ${error.message || 'Erro desconhecido'}`);
      setLoading(false);
    }
  }, [slug, maxRetries, initialRetryDelay]);
  
  // Initial fetch with cleanup
  useEffect(() => {
    // Cancel any pending requests when slug changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset state for new slug
    retryCountRef.current = 0;
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    fetchProfessionalData(abortControllerRef.current.signal);
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchProfessionalData]);
  
  // Function to manually retry fetching data
  const retry = useCallback(() => {
    retryCountRef.current = 0; // Reset retry counter
    toast.info("Tentando buscar dados do profissional novamente...");
    fetchProfessionalData();
  }, [fetchProfessionalData]);
  
  // Function to invalidate cache
  const invalidateCache = useCallback(() => {
    if (slug) {
      ProfessionalCache.invalidate(slug);
    }
  }, [slug]);
  
  return { 
    professional, 
    loading, 
    error,
    retry,
    invalidateCache
  };
};
