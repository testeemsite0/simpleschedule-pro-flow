
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';
import { toast } from 'sonner';

// Simple cache implementation
const professionalCache = new Map<string, {data: Professional; timestamp: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

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
  
  // Check cache first
  const checkCache = useCallback((slug: string): Professional | null => {
    const cached = professionalCache.get(slug);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log("Using cached professional data for:", slug);
      return cached.data;
    }
    return null;
  }, []);
  
  // Update cache
  const updateCache = useCallback((slug: string, data: Professional) => {
    professionalCache.set(slug, {
      data,
      timestamp: Date.now()
    });
  }, []);
  
  const fetchProfessionalData = useCallback(async (signal?: AbortSignal) => {
    if (!slug) {
      setLoading(false);
      setError("Link de agendamento inválido");
      return;
    }
    
    // Check cache first
    const cachedData = checkCache(slug);
    if (cachedData) {
      setProfessional(cachedData);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Fetching professional data for slug: ${slug} (attempt: ${retryCountRef.current + 1})`);
      
      // Instead of using abortSignal directly on the Supabase query builder,
      // we'll check if the request has been aborted before and after the query
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();
        
      // Check if the request was aborted during the query
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }
        
      if (profileError) {
        console.error("Error fetching professional by slug:", profileError);
        
        if (profileError.code === '406' || profileError.message?.includes('No rows found')) {
          setError("Profissional não encontrado");
        } else if (profileError.code === '429' || profileError.message?.includes('rate limit')) {
          // Resource-related error - trigger exponential backoff retry
          throw new Error('RESOURCE_ERROR');
        } else {
          setError(`Erro ao buscar dados do profissional: ${profileError.message}`);
        }
        
        setLoading(false);
        return;
      }
      
      if (!data) {
        console.error("No professional found with slug:", slug);
        setError("Profissional não encontrado");
        setLoading(false);
        return;
      }
      
      console.log("Found professional:", data);
      
      const professionalData: Professional = {
        id: data.id,
        name: data.name,
        email: data.email,
        profession: data.profession,
        bio: data.bio || undefined,
        slug: data.slug,
        address: undefined,
        avatar: data.avatar || undefined
      };
      
      // Update cache and state
      updateCache(slug, professionalData);
      setProfessional(professionalData);
      setLoading(false);
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (error: any) {
      // If the request was aborted, don't update state or show errors
      if (error.message === 'Request aborted' || signal?.aborted) {
        console.log("Request was aborted, ignoring");
        return;
      }
      
      console.error("Error fetching professional data:", error);
      
      // Implement exponential backoff for resource errors
      const isResourceError = 
        error.message === 'RESOURCE_ERROR' || 
        error.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error.code === 429 || 
        (error.error && error.error.code === 429);
      
      if (isResourceError && retryCountRef.current < maxRetries) {
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
      setError(isResourceError 
        ? "Servidor ocupado. Tente novamente mais tarde." 
        : "Erro ao carregar dados do profissional");
      
      setLoading(false);
      
      if (retryCountRef.current >= maxRetries) {
        toast.error("Erro ao carregar dados do profissional após várias tentativas");
      }
    }
  }, [slug, checkCache, updateCache]);
  
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
  
  return { 
    professional, 
    loading, 
    error,
    retry
  };
};
