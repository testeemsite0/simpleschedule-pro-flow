
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
  const maxRetries = 5; // Aumentado de 3 para 5
  const initialRetryDelay = 2000; // Aumentado de 1000ms para 2000ms (2 segundos)
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
      
      // Tentativa direta sem cache primeiro
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('slug', slug) // Usar ilike para busca case-insensitive
        .maybeSingle();
      
      // If the request was aborted, don't update state
      if (signal?.aborted) {
        return;
      }
      
      if (error) {
        console.error("Error fetching professional by slug directly:", error);
        
        // Cair no fluxo padrão com cache caso a busca direta falhe
        const result = await fetchProfessionalBySlug(slug, signal);
        
        if (signal?.aborted) {
          return;
        }
        
        if (result.error) {
          // Handle resource error with exponential backoff retry
          if ((result.error === 'RESOURCE_ERROR' || error.code === '429') && retryCountRef.current < maxRetries) {
            const retryDelay = initialRetryDelay * Math.pow(2, retryCountRef.current);
            retryCountRef.current += 1;
            
            console.log(`Resource error. Retrying in ${retryDelay}ms (attempt ${retryCountRef.current} of ${maxRetries})`);
            
            // Mostrar toast a partir da segunda tentativa
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
        return;
      }
      
      if (!data) {
        console.log(`No professional found with slug '${slug}'`);
        
        // Tentar buscar sem case-sensitivity
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('slug', `%${slug}%`)
          .limit(1);
        
        if (fuzzyError) {
          console.error("Error in fuzzy search:", fuzzyError);
          setError(`Não foi possível encontrar profissional com o slug '${slug}'`);
          setLoading(false);
          return;
        }
        
        if (fuzzyData && fuzzyData.length > 0) {
          console.log("Found professional with similar slug:", fuzzyData[0]);
          
          // Map data to Professional type
          const professionalData: Professional = {
            id: fuzzyData[0].id,
            name: fuzzyData[0].name,
            email: fuzzyData[0].email,
            profession: fuzzyData[0].profession,
            bio: fuzzyData[0].bio || undefined,
            slug: fuzzyData[0].slug,
            address: undefined,
            avatar: fuzzyData[0].avatar || undefined
          };
          
          // Update cache and state
          ProfessionalCache.set(slug, professionalData);
          setProfessional(professionalData);
          setLoading(false);
          return;
        }
        
        setError(`Profissional não encontrado com slug: ${slug}`);
        setLoading(false);
        return;
      }
      
      console.log("Found professional directly:", data);
      
      // Map data to Professional type
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
      
      // Update cache
      ProfessionalCache.set(slug, professionalData);
      
      setProfessional(professionalData);
      setLoading(false);
      retryCountRef.current = 0; // Reset retry count
      
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

import { supabase } from '@/integrations/supabase/client';
