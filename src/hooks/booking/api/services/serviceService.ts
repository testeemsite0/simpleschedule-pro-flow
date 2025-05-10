
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch services - high priority data
 */
export const fetchServices = (professionalId: string, signal?: AbortSignal) => 
  fetchData<Service>({
    type: 'services',
    professionalId,
    signal,
    priority: 'high',
    skipQueue: true, // Don't queue services, they're essential
    ttl: 60 * 10 * 2 // Cache services for longer (10 min * 2)
  }, async () => {
    return await supabase
      .from('services')
      .select('id, name, duration_minutes, price, active')
      .eq('professional_id', professionalId)
      .eq('active', true);
  });
