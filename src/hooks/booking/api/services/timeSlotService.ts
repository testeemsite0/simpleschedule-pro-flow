
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch time slots - medium priority
 */
export const fetchTimeSlots = (professionalId: string, signal?: AbortSignal) => 
  fetchData<TimeSlot>({
    type: 'timeSlots',
    professionalId,
    signal,
    priority: 'medium',
    ttl: 60 * 10 * 1.5 // Cache time slots for longer (15 min)
  }, async () => {
    console.log("TimeSlotService: Executing DB query for professional:", professionalId);
    
    const { data, error } = await supabase
      .from('time_slots')
      .select('id, day_of_week, start_time, end_time, team_member_id, available, appointment_duration_minutes, lunch_break_start, lunch_break_end, professional_id, created_at, updated_at')
      .eq('professional_id', professionalId);
      
    if (error) {
      console.error("TimeSlotService: Database error fetching time slots:", error);
      throw error;
    }
    
    // Map data to the expected TimeSlot type
    const timeSlots = data?.map(slot => ({
      id: slot.id,
      professional_id: slot.professional_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      available: slot.available ?? true,
      created_at: slot.created_at || undefined,
      updated_at: slot.updated_at || undefined,
      appointment_duration_minutes: slot.appointment_duration_minutes || undefined,
      lunch_break_start: slot.lunch_break_start || undefined,
      lunch_break_end: slot.lunch_break_end || undefined,
      team_member_id: slot.team_member_id || undefined
    } as TimeSlot)) || [];
    
    console.log(`TimeSlotService: Successfully fetched ${timeSlots.length} time slots`);
    return { data: timeSlots, error: null };
  });
