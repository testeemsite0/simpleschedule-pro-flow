
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';
import { toast } from 'sonner';

/**
 * Hook to fetch professional data by slug - used for public booking links
 */
export const usePublicProfessionalData = (slug: string | undefined) => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!slug) {
        setLoading(false);
        setError("Link de agendamento inválido");
        return;
      }
      
      try {
        console.log("Fetching professional data for slug:", slug);
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (profileError) {
          console.error("Error fetching professional by slug:", profileError);
          setError("Profissional não encontrado");
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
      } catch (error) {
        console.error("Error fetching professional data:", error);
        setError("Erro ao carregar dados do profissional");
        toast.error("Erro ao carregar dados do profissional");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfessionalData();
  }, [slug]);
  
  return { professional, loading, error };
};
