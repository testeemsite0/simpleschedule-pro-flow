
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';

export interface PublicProfessionalData {
  professional: Professional | null;
  isLoading: boolean;
  error: string | null;
}

export const usePublicProfessionalData = (slug: string): PublicProfessionalData => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!slug) {
        console.error('usePublicProfessionalData: No slug provided');
        setError('Slug do profissional não encontrado');
        setIsLoading(false);
        return;
      }

      console.log('usePublicProfessionalData: Fetching data for slug:', slug);
      setIsLoading(true);
      setError(null);

      try {
        // Query the profiles table to get professional data by slug
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            profession,
            bio,
            slug,
            company_name,
            display_name
          `)
          .eq('slug', slug)
          .single();

        if (queryError) {
          console.error('usePublicProfessionalData: Query error:', queryError);
          throw queryError;
        }

        if (!data) {
          console.error('usePublicProfessionalData: No professional found for slug:', slug);
          setError('Profissional não encontrado');
          setProfessional(null);
          return;
        }

        console.log('usePublicProfessionalData: Professional data found:', data);

        // Map the data to the Professional type
        // Priority: display_name > name for the display name
        const professionalData: Professional = {
          id: data.id,
          name: data.display_name || data.name, // Use display_name first, fallback to name
          email: data.email,
          profession: data.profession,
          bio: data.bio || undefined,
          slug: data.slug,
          address: '', // Not stored in profiles, could be added later
        };

        setProfessional(professionalData);
        console.log('usePublicProfessionalData: Professional data set successfully:', professionalData);

      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao carregar dados do profissional';
        console.error('usePublicProfessionalData: Error fetching professional:', err);
        setError(errorMessage);
        setProfessional(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionalData();
  }, [slug]);

  return { professional, isLoading, error };
};
