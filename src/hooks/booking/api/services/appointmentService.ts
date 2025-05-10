
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { fetchData } from '../dataFetcherCore';

/**
 * Fetch appointments - lowest priority
 */
export const fetchAppointments = (professionalId: string, signal?: AbortSignal) => 
  fetchData<Appointment>({
    type: 'appointments',
    professionalId,
    signal,
    priority: 'low'
  }, async () => {
    // Filter to only get current and future appointments to reduce data size
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return await supabase
      .from('appointments')
      .select('id, date, start_time, end_time, team_member_id, status')
      .eq('professional_id', professionalId)
      .gte('date', formattedDate) // Only get current and future appointments
      .order('date', { ascending: true });
  });

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: any) => {
  console.log("Creating appointment with complete data:", JSON.stringify(appointmentData, null, 2));
  
  // Validate required fields to prevent the "incomplete data" error
  const requiredFields = [
    'professional_id', 
    'team_member_id', 
    'client_name', 
    'client_email', 
    'date', 
    'start_time', 
    'end_time'
  ];
  
  const missingFields = requiredFields.filter(field => !appointmentData[field]);
  
  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    throw new Error(`Dados incompletos: ${missingFields.join(', ')}`);
  }
  
  try {
    return await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();
  } catch (error: any) {
    console.error("Error in Supabase call:", error);
    throw error;
  }
}
