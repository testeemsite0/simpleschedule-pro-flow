
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';
import { toast } from 'sonner';

/**
 * Hook to fetch professional data by slug - used for public booking links
 * Now with retry mechanism and better error handling
 */
export const usePublicProfessionalData = (slug: string | undefined) => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchProfessionalData = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setError("Link de agendamento inválido");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching professional data for slug: ${slug} (attempt: ${retryCount + 1})`);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (profileError) {
        console.error("Error fetching professional by slug:", profileError);
        
        if (profileError.code === '406' || profileError.message?.includes('No rows found')) {
          setError("Profissional não encontrado");
        } else if (profileError.code === '429' || profileError.message?.includes('rate limit')) {
          setError("Muitas solicitações. Tente novamente mais tarde.");
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
      
      setProfessional(professionalData);
    } catch (error: any) {
      console.error("Error fetching professional data:", error);
      
      // Check if the error is related to rate limiting or insufficient resources
      if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES') || 
          error.code === 429 || 
          (error.error && error.error.code === 429)) {
        setError("Servidor ocupado. Tente novamente em alguns momentos.");
      } else {
        setError("Erro ao carregar dados do profissional");
      }
      
      toast.error("Erro ao carregar dados do profissional");
    } finally {
      setLoading(false);
    }
  }, [slug, retryCount]);
  
  // Initial fetch
  useEffect(() => {
    fetchProfessionalData();
  }, [fetchProfessionalData]);
  
  // Function to manually retry fetching data
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    toast.info("Tentando buscar dados do profissional novamente...");
  }, []);
  
  return { 
    professional, 
    loading, 
    error,
    retry
  };
};
