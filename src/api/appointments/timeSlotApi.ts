
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types';

// Define primitive type aliases
type ProfessionalId = string;
type TeamMemberId = string;
type TimeSlotId = string;

export const getTimeSlotsByProfessional = async (professionalId: ProfessionalId): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    
    return data as TimeSlot[];
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }
};

export const getTimeSlotsByTeamMember = async (teamMemberId: TeamMemberId): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    
    return data as TimeSlot[];
  } catch (error) {
    console.error('Error fetching team member time slots:', error);
    return [];
  }
};

export const addTimeSlot = async (timeSlot: Omit<TimeSlot, "id">): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('time_slots')
      .insert([timeSlot]);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding time slot:', error);
    return false;
  }
};

export const updateTimeSlot = async (timeSlot: TimeSlot): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('time_slots')
      .update(timeSlot)
      .eq('id', timeSlot.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating time slot:', error);
    return false;
  }
};

export const deleteTimeSlot = async (timeSlotId: TimeSlotId): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', timeSlotId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return false;
  }
};
