
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
      .select('id, date, start_time, end_time, team_member_id, status, professional_id, client_name, client_email, client_phone, notes, service_id, price, insurance_plan_id, source, created_at, updated_at')
      .eq('professional_id', professionalId)
      .gte('date', formattedDate) // Only get current and future appointments
      .order('date', { ascending: true });
      
    if (error) {
      console.error("AppointmentService: Database error fetching appointments:", error);
      throw error;
    }
    
    // Map data to the expected Appointment type
    const appointments = data?.map(apt => ({
      id: apt.id,
      professional_id: apt.professional_id,
      client_name: apt.client_name,
      client_email: apt.client_email,
      client_phone: apt.client_phone || undefined,
      date: apt.date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      notes: apt.notes || undefined,
      status: apt.status as 'scheduled' | 'completed' | 'canceled',
      created_at: apt.created_at || undefined,
      updated_at: apt.updated_at || undefined,
      source: apt.source as 'client' | 'manual' || undefined,
      service_id: apt.service_id || undefined,
      price: apt.price || undefined,
      team_member_id: apt.team_member_id || undefined,
      insurance_plan_id: apt.insurance_plan_id || undefined
    } as Appointment)) || [];
    
    console.log(`AppointmentService: Successfully fetched ${appointments.length} appointments`);
    return { data: appointments, error: null };
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
