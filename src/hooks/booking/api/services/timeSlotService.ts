
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
    return await supabase
      .from('time_slots')
      .select('id, day_of_week, start_time, end_time, team_member_id, available, appointment_duration_minutes, lunch_break_start, lunch_break_end')
      .eq('professional_id', professionalId);
  });
