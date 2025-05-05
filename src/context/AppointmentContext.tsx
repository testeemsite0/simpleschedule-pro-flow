import React, { createContext, useState, useContext } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  getTimeSlotsByProfessional: (professionalId: string) => Promise<TimeSlot[]>;
  getTimeSlotsByTeamMember: (teamMemberId: string) => Promise<TimeSlot[]>;
  addAppointment: (appointment: Appointment) => void;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
  checkInsurancePlanLimit: (planId: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  addTimeSlot: (timeSlot: Omit<TimeSlot, "id">) => Promise<boolean>;
  updateTimeSlot: (timeSlot: TimeSlot) => Promise<boolean>;
  deleteTimeSlot: (timeSlotId: string) => Promise<boolean>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  
  // Fetch appointments from Supabase
  const getAppointmentsByProfessional = async (professionalId: string): Promise<Appointment[]> => {
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
  const getTimeSlotsByProfessional = async (professionalId: string): Promise<TimeSlot[]> => {
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
  const getTimeSlotsByTeamMember = async (teamMemberId: string): Promise<TimeSlot[]> => {
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
  const addAppointment = (appointment: Appointment) => {
    setAppointments((prevAppointments) => [...prevAppointments, appointment]);
  };
  
  // Count monthly appointments to check free tier limits
  const countMonthlyAppointments = async (professionalId: string): Promise<number> => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('professional_id', professionalId)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0]);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error counting monthly appointments:', error);
      return 0;
    }
  };
  
  // Check if professional is within free tier limits or has premium subscription
  const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // First check if the user has a premium subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('check-subscription', {
        body: { userId: professionalId }
      });
      
      if (subscriptionError) {
        console.error('Error checking subscription status:', subscriptionError);
        return false;
      }
      
      // If the user has a premium subscription, they are not limited
      if (subscriptionData.isPremium) {
        return true;
      }
      
      // If not premium, check if they're within the free tier limit
      return subscriptionData.isWithinFreeLimit;
      
    } catch (error) {
      console.error('Error checking appointment limits:', error);
      return false;
    }
  };
  
  // Check if an insurance plan has reached its limit
  const checkInsurancePlanLimit = async (planId: string): Promise<boolean> => {
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
  
  // ADDED: Cancel an appointment
  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
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
  
  // ADDED: Add a new time slot
  const addTimeSlot = async (timeSlot: Omit<TimeSlot, "id">): Promise<boolean> => {
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
  
  // ADDED: Update an existing time slot
  const updateTimeSlot = async (timeSlot: TimeSlot): Promise<boolean> => {
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
  
  // ADDED: Delete a time slot
  const deleteTimeSlot = async (timeSlotId: string): Promise<boolean> => {
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
  
  return (
    <AppointmentContext.Provider 
      value={{
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
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};
