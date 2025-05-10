
/**
 * API layer for fetching professional data
 */

import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';
import { ProfessionalCache } from '../cache/professionalCache';

type FetchResult = {
  data: Professional | null;
  error: string | null;
};

/**
 * Fetches professional data by slug from Supabase
 */
export const fetchProfessionalBySlug = async (
  slug: string, 
  signal?: AbortSignal
): Promise<FetchResult> => {
  // Check if the request was aborted
  if (signal?.aborted) {
    return { data: null, error: 'Request aborted' };
  }

  // Check cache first
  const cachedData = ProfessionalCache.get(slug);
  if (cachedData) {
    console.log("Found cached professional data for:", slug);
    return { data: cachedData, error: null };
  }

  try {
    console.log(`Fetching professional data for slug: ${slug}`);

    // Primeiro tenta uma correspondência exata
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    // Se não encontrar, tenta uma busca insensível a maiúsculas e minúsculas
    if (!data && !error) {
      console.log(`No exact match found for slug '${slug}', trying case-insensitive search`);
      
      const { data: flexData, error: flexError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('slug', slug)
        .maybeSingle();
        
      if (flexError) {
        console.error("Error in flexible slug search:", flexError);
      } else if (flexData) {
        console.log("Found via case-insensitive search:", flexData);
        data = flexData;
      }
    }

    // Check if the request was aborted during the query
    if (signal?.aborted) {
      return { data: null, error: 'Request aborted' };
    }

    // Handle query errors
    if (error) {
      console.error("Error fetching professional by slug:", error);
      
      if (error.code === '406' || error.message?.includes('No rows found')) {
        return { data: null, error: `Profissional não encontrado com slug: ${slug}` };
      } else if (error.code === 'PGRST116' || error.message?.includes('Results contain')) {
        console.error("Multiple profiles found with slug:", slug);
        
        // Tentar pegar só o primeiro
        const { data: multipleData, error: multipleError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .limit(1);
          
        if (multipleError || !multipleData || multipleData.length === 0) {
          return { data: null, error: `Múltiplos profissionais encontrados com o mesmo slug. Por favor, contate o suporte.` };
        }
        
        // Usar o primeiro resultado
        data = multipleData[0];
      } else if (error.code === '429' || error.message?.includes('rate limit')) {
        return { data: null, error: 'RESOURCE_ERROR' };
      } else {
        return { data: null, error: `Erro ao buscar dados do profissional: ${error.message}` };
      }
    }

    // Handle no data case
    if (!data) {
      console.error("No professional found with slug:", slug);
      
      // Tentativa final: busca parcial
      const { data: partialData, error: partialError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('slug', `%${slug}%`)
        .limit(1);
        
      if (partialError || !partialData || partialData.length === 0) {
        return { data: null, error: `Profissional não encontrado com slug: ${slug}` };
      }
      
      // Usar o resultado parcial
      data = partialData[0];
      console.log("Found professional with partial slug match:", data);
    } else {
      console.log("Found professional:", data);
    }
    
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
    
    return { data: professionalData, error: null };
  } catch (error: any) {
    const errorMessage = error.message || 'Erro desconhecido';
    console.error("Error in fetchProfessionalBySlug:", errorMessage);
    
    return { 
      data: null, 
      error: error.message === 'RESOURCE_ERROR' ? 'RESOURCE_ERROR' : errorMessage
    };
  }
};
