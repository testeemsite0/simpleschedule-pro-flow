
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
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId)
      .eq('free_tier_used', true)  // Only count appointments that used the free tier
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

// Completely rewrite this function to avoid type recursion issues
export const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
  if (!professionalId) {
    console.log('No professional ID provided');
    return false;
  }
  
  try {
    console.log(`Checking free tier limit for professional ${professionalId}`);
    
    // Make the edge function call with minimal typing
    const response = await supabase.functions.invoke('check-subscription', {
      body: { userId: professionalId }
    });
    
    // Handle error case first
    if (response.error) {
      console.error('Error checking subscription status:', response.error);
      return false;
    }
    
    // Handle the success case with careful type checking
    if (response.data) {
      // First check if the user has premium
      const isPremium = response.data.isPremium === true;
      if (isPremium) {
        console.log('Professional has premium subscription, no limits applied');
        return true;
      }
      
      // Get monthly appointment count
      let appointmentCount = 0;
      
      // Use the count from the response if available
      if (typeof response.data.monthlyAppointments === 'number') {
        appointmentCount = response.data.monthlyAppointments;
      } else {
        // Fall back to counting directly from the database
        appointmentCount = await countMonthlyAppointments(professionalId);
      }
      
      // Free tier limit is strictly less than 5
      const isWithinLimit = appointmentCount < 5;
      console.log(`Professional has ${appointmentCount} monthly appointments, within limit: ${isWithinLimit}`);
      return isWithinLimit;
    }
    
    // If we can't determine from the response, count directly
    const count = await countMonthlyAppointments(professionalId);
    const isWithinLimit = count < 5;
    console.log(`Professional has ${count} monthly appointments, within limit: ${isWithinLimit}`);
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
