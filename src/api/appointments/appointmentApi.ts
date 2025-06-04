
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

// Define primitive type aliases
type AppointmentId = string;
type ProfessionalId = string;

// Define appointment-related API functions with explicit return types
export const getAppointmentsByProfessional = async (professionalId: ProfessionalId): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    return data as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const countMonthlyAppointments = async (professionalId: ProfessionalId): Promise<number> => {
  try {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', professionalId)
      .eq('free_tier_used', true)
      .gte('date', firstDay.toISOString().split('T')[0])
      .lte('date', lastDay.toISOString().split('T')[0]);
      
    if (error) throw error;
    
    console.log(`Counted ${count} monthly appointments for professional ${professionalId}`);
    return count || 0;
  } catch (error) {
    console.error('Error counting monthly appointments:', error);
    return 0;
  }
};

// Improved version that properly checks subscription limits
export const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
  if (!professionalId) {
    console.log('No professional ID provided');
    return false;
  }
  
  try {
    console.log(`Checking free tier limit for professional ${professionalId}`);
    
    // Use the corrected check-subscription function
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: { userId: professionalId }
    });
    
    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    console.log('Subscription check result:', data);
    
    // Premium users have no limits
    if (data && data.isPremium === true) {
      console.log('Professional has premium subscription, no limits applied');
      return true;
    }
    
    // Use the calculated value from the edge function
    if (data && typeof data.isWithinFreeLimit === 'boolean') {
      console.log(`Within free limit: ${data.isWithinFreeLimit}`);
      return data.isWithinFreeLimit;
    }
    
    // Fallback to manual counting if edge function fails
    const appointmentCount = await countMonthlyAppointments(professionalId);
    const isWithinLimit = appointmentCount < 5;
    console.log(`Fallback check - Professional has ${appointmentCount} appointments, within limit: ${isWithinLimit}`);
    return isWithinLimit;
    
  } catch (error) {
    console.error('Error checking appointment limits:', error);
    return false;
  }
};

export const checkInsurancePlanLimit = async (planId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('insurance_plans')
      .select('limit_per_plan, current_appointments')
      .eq('id', planId)
      .single();
      
    if (error) throw error;
    
    if (!data || data.limit_per_plan === null) {
      // No limit set, always allowed
      return true;
    }
    
    // Check if the current count is less than the limit
    return (data.current_appointments || 0) < data.limit_per_plan;
    
  } catch (error) {
    console.error('Error checking insurance plan limit:', error);
    // In case of error, default to allowed
    return true;
  }
};

export const cancelAppointment = async (appointmentId: AppointmentId): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', appointmentId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return false;
  }
};
