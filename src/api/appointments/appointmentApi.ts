
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

// Use direct fetch to avoid TypeScript inference issues
export const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
  if (!professionalId) {
    console.log('No professional ID provided');
    return false;
  }
  
  try {
    console.log(`Checking free tier limit for professional ${professionalId}`);
    
    // Get the session to include authorization header
    const { data: { session } } = await supabase.auth.getSession();
    
    // Use direct fetch call to avoid TypeScript inference issues
    const response = await fetch(`https://iabhmwqracdcdnevtpzt.supabase.co/functions/v1/check-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYmhtd3FyYWNkY2RuZXZ0cHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MDY5OTcsImV4cCI6MjA2MTM4Mjk5N30.ITy9iYrYUqYGvXsLL_OempEACnzFGDe3jB9WaIX9HqA'
      },
      body: JSON.stringify({ userId: professionalId })
    });
    
    // Handle potential errors first
    if (!response.ok) {
      console.error('Error checking subscription status:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    
    // Premium users have no limits
    if (data && data.isPremium === true) {
      console.log('Professional has premium subscription, no limits applied');
      return true;
    }
    
    // Use pre-calculated value if available
    if (data && typeof data.isWithinFreeLimit === 'boolean') {
      console.log(`Using edge calculation: within limit = ${data.isWithinFreeLimit}`);
      return data.isWithinFreeLimit;
    }
    
    // Get appointment count from the best available source
    let appointmentCount = 0;
    
    if (data && typeof data.monthlyAppointments === 'number') {
      appointmentCount = data.monthlyAppointments;
      console.log(`Using appointment count from edge: ${appointmentCount}`);
    } else {
      appointmentCount = await countMonthlyAppointments(professionalId);
      console.log(`Using appointment count from DB: ${appointmentCount}`);
    }
    
    // Apply free tier limit (less than 5)
    const isWithinLimit = appointmentCount < 5;
    console.log(`Professional has ${appointmentCount} appointments, within limit: ${isWithinLimit}`);
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
