
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

// Define primitive type alias
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

// Fix the circular dependency by using a direct implementation rather than type references
export const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
  if (!professionalId) return false;
  
  try {
    console.log(`Checking free tier limit for professional ${professionalId}`);
    
    // First check if the user has a premium subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('check-subscription', {
      body: { userId: professionalId }
    });
    
    if (subscriptionError) {
      console.error('Error checking subscription status:', subscriptionError);
      return false;
    }
    
    console.log('Subscription check result:', subscriptionData);
    
    // If the user has a premium subscription, they are not limited
    if (subscriptionData.isPremium) {
      console.log('Professional has premium subscription, no limits applied');
      return true;
    }
    
    // If not premium, check if they're within the free tier limit (strictly less than 5)
    const isWithin = subscriptionData.monthlyAppointments < 5;
    console.log(`Professional has ${subscriptionData.monthlyAppointments} monthly appointments, within limit: ${isWithin}`);
    return isWithin;
    
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
