
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
    console.log("ServiceService: Executing DB query for professional:", professionalId);
    
    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price, active, professional_id, created_at, updated_at, description')
      .eq('professional_id', professionalId)
      .eq('active', true);
      
    if (error) {
      console.error("ServiceService: Database error fetching services:", error);
      throw error;
    }
    
    // Map data to the expected Service type
    const services = data?.map(service => ({
      id: service.id,
      professional_id: service.professional_id,
      name: service.name,
      description: service.description || undefined,
      price: service.price,
      duration_minutes: service.duration_minutes,
      active: service.active,
      created_at: service.created_at || new Date().toISOString(),
      updated_at: service.updated_at || new Date().toISOString()
    } as Service)) || [];
    
    console.log(`ServiceService: Successfully fetched ${services.length} services`);
    return { data: services, error: null };
  });
