
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch team members - high priority, essential data
 */
export const fetchTeamMembers = (professionalId: string, signal?: AbortSignal) => 
  fetchData<TeamMember>({
    type: 'teamMembers',
    professionalId,
    signal,
    priority: 'high',
    skipQueue: true, // Don't queue team members, they're essential
    ttl: 60 * 10 * 2 // Cache team members for longer (10 min * 2)
  }, async () => {
    console.log("Fetching team members for professional:", professionalId);
    
    const { data, error } = await supabase
      .from('team_members')
      .select('id, name, position, active')
      .eq('professional_id', professionalId)
      .eq('active', true);
      
    if (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
    
    // Ensure we always return an array (even if empty)
    if (!data || !Array.isArray(data)) {
      console.warn("No team members returned or invalid response format");
      return { data: [], error: null };
    }
    
    console.log(`Successfully fetched ${data.length} team members`);
    return { data, error: null };
  });
