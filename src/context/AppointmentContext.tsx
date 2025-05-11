
import React, { createContext, useState, useContext } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define more granular types for our functions to avoid circular references
type AppointmentsFetcher = (professionalId: string) => Promise<Appointment[]>;
type TimeSlotsFetcher = (professionalId: string) => Promise<TimeSlot[]>;
type TeamMemberTimeSlotsFetcher = (teamMemberId: string) => Promise<TimeSlot[]>;
type AppointmentCounter = (professionalId: string) => Promise<number>;
type FreeLimitChecker = (professionalId: string) => Promise<boolean>;
type InsuranceLimitChecker = (planId: string) => Promise<boolean>;
type AppointmentCanceler = (appointmentId: string) => Promise<boolean>;
type TimeSlotAdder = (timeSlot: Omit<TimeSlot, "id">) => Promise<boolean>;
type TimeSlotUpdater = (timeSlot: TimeSlot) => Promise<boolean>;
type TimeSlotDeleter = (timeSlotId: string) => Promise<boolean>;

// Define the context type explicitly with function types to avoid deep instantiation
interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getAppointmentsByProfessional: AppointmentsFetcher;
  getTimeSlotsByProfessional: TimeSlotsFetcher;
  getTimeSlotsByTeamMember: TeamMemberTimeSlotsFetcher;
  addAppointment: (appointment: Appointment) => void;
  countMonthlyAppointments: AppointmentCounter;
  isWithinFreeLimit: FreeLimitChecker;
  checkInsurancePlanLimit: InsuranceLimitChecker;
  cancelAppointment: AppointmentCanceler;
  addTimeSlot: TimeSlotAdder;
  updateTimeSlot: TimeSlotUpdater;
  deleteTimeSlot: TimeSlotDeleter;
}

// Create the context with an undefined initial value
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  
  // Fetch appointments from Supabase
  const getAppointmentsByProfessional: AppointmentsFetcher = async (professionalId) => {
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
  
  // Get time slots for a professional
  const getTimeSlotsByProfessional: TimeSlotsFetcher = async (professionalId) => {
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
  
  // Get time slots for a specific team member
  const getTimeSlotsByTeamMember: TeamMemberTimeSlotsFetcher = async (teamMemberId) => {
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
  
  // Add new appointment to the state and database
  const addAppointment = (appointment: Appointment): void => {
    setAppointments((prevAppointments) => [...prevAppointments, appointment]);
  };
  
  // Count monthly appointments to check free tier limits
  const countMonthlyAppointments: AppointmentCounter = async (professionalId) => {
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
  
  // Check if professional is within free tier limits or has premium subscription
  const isWithinFreeLimit: FreeLimitChecker = async (professionalId) => {
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
  
  // Check if an insurance plan has reached its limit
  const checkInsurancePlanLimit: InsuranceLimitChecker = async (planId) => {
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
  
  // Cancel an appointment
  const cancelAppointment: AppointmentCanceler = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      // Update local state to reflect the change
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'canceled' as const } 
          : appointment
      ));
      
      return true;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return false;
    }
  };
  
  // Add a new time slot
  const addTimeSlot: TimeSlotAdder = async (timeSlot) => {
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
  
  // Update an existing time slot
  const updateTimeSlot: TimeSlotUpdater = async (timeSlot) => {
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
  
  // Delete a time slot
  const deleteTimeSlot: TimeSlotDeleter = async (timeSlotId) => {
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
  
  // Create the context value object explicitly
  const contextValue: AppointmentContextType = {
    appointments,
    setAppointments,
    getAppointmentsByProfessional,
    getTimeSlotsByProfessional,
    getTimeSlotsByTeamMember,
    addAppointment,
    countMonthlyAppointments,
    isWithinFreeLimit,
    checkInsurancePlanLimit,
    cancelAppointment,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
  };
  
  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
};
