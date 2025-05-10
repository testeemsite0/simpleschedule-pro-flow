
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch team members - high priority, essential data
 */
export const fetchTeamMembers = async (professionalId: string, signal?: AbortSignal) => {
  try {
    console.log("TeamMemberService: Starting fetch for professional:", professionalId);
    
    if (!professionalId) {
      console.error("TeamMemberService: Missing professionalId parameter");
      return [];
    }
    
    // Use the fetchData utility with proper error handling
    return await fetchData<TeamMember>({
      type: 'teamMembers',
      professionalId,
      signal,
      priority: 'high',
      skipQueue: true, // Don't queue team members, they're essential
      ttl: 60 * 10 * 2 // Cache team members for longer (10 min * 2)
    }, async () => {
      console.log("TeamMemberService: Executing DB query for professional:", professionalId);
      
      // Direct database query
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, position, active, professional_id, created_at, updated_at, email, avatar')
        .eq('professional_id', professionalId)
        .eq('active', true);
        
      if (error) {
        console.error("TeamMemberService: Database error fetching team members:", error);
        throw error;
      }
      
      // Log the raw database response for debugging
      console.log("TeamMemberService: Raw DB response:", data);
      
      // Ensure we always return an array (even if empty)
      if (!data || !Array.isArray(data)) {
        console.warn("TeamMemberService: No team members returned or invalid response format");
        return { data: [], error: null };
      }
      
      // Map database results to expected type
      const teamMembers = data.map(member => ({
        id: member.id,
        professional_id: member.professional_id,
        name: member.name,
        email: member.email || undefined,
        position: member.position || undefined,
        avatar: member.avatar || undefined,
        active: member.active,
        created_at: member.created_at || new Date().toISOString(),
        updated_at: member.updated_at || new Date().toISOString()
      } as TeamMember));
      
      console.log(`TeamMemberService: Successfully fetched ${teamMembers.length} team members`);
      return { data: teamMembers, error: null };
    });
  } catch (error) {
    console.error("TeamMemberService: Critical error in fetchTeamMembers:", error);
    // Return empty array on error to prevent cascading failures
    return [];
  }
};
