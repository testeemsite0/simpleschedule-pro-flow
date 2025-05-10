
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
    console.log("AppointmentService: Executing DB query for professional:", professionalId);
    
    // Filter to only get current and future appointments to reduce data size
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('appointments')
      .select('id, date, start_time, end_time, team_member_id, status')
      .eq('professional_id', professionalId)
      .gte('date', formattedDate) // Only get current and future appointments
      .order('date', { ascending: true });
      
    if (error) {
      console.error("AppointmentService: Database error fetching appointments:", error);
      throw error;
    }
    
    console.log(`AppointmentService: Successfully fetched ${data?.length || 0} appointments`);
    return { data: data || [], error: null };
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
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();
      
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
    
    console.log("Appointment created successfully:", data);
    return { data, error };
  } catch (error: any) {
    console.error("Error in Supabase call:", error);
    throw error;
  }
}
