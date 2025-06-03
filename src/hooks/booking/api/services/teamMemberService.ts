
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
      
      // Direct database query for team members
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select('id, name, position, active, professional_id, created_at, updated_at, email, avatar')
        .eq('professional_id', professionalId)
        .eq('active', true);
        
      if (teamMembersError) {
        console.error("TeamMemberService: Database error fetching team members:", teamMembersError);
        throw teamMembersError;
      }
      
      console.log("TeamMemberService: Raw team members data:", teamMembersData);
      
      // If no team members found, create a virtual team member using the professional's data
      if (!teamMembersData || teamMembersData.length === 0) {
        console.log("TeamMemberService: No team members found, fetching professional data for fallback");
        
        // Fetch professional data to create virtual team member
        const { data: professionalData, error: professionalError } = await supabase
          .from('profiles')
          .select('id, name, display_name, profession')
          .eq('id', professionalId)
          .single();
          
        if (professionalError) {
          console.error("TeamMemberService: Error fetching professional data:", professionalError);
          return { data: [], error: null };
        }
        
        if (professionalData) {
          console.log("TeamMemberService: Creating virtual team member from professional data:", professionalData);
          
          // Create a virtual team member representing the professional
          const virtualTeamMember: TeamMember = {
            id: professionalData.id, // Use professional ID as team member ID
            professional_id: professionalData.id,
            name: professionalData.display_name || professionalData.name,
            email: undefined,
            position: professionalData.profession || 'Profissional',
            avatar: undefined,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("TeamMemberService: Virtual team member created:", virtualTeamMember);
          return { data: [virtualTeamMember], error: null };
        }
        
        console.warn("TeamMemberService: No professional data found either");
        return { data: [], error: null };
      }
      
      // Map database results to expected type
      const teamMembers = teamMembersData.map(member => ({
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
