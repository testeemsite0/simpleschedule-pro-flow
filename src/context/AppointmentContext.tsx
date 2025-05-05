import React, { createContext, useState, useContext } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  getTimeSlotsByProfessional: (professionalId: string) => Promise<TimeSlot[]>;
  addAppointment: (appointment: Appointment) => void;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
  checkInsurancePlanLimit: (planId: string) => Promise<boolean>;
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
  
  return (
    <AppointmentContext.Provider 
      value={{
        appointments,
        setAppointments,
        getAppointmentsByProfessional,
        getTimeSlotsByProfessional,
        addAppointment,
        countMonthlyAppointments,
        isWithinFreeLimit,
        checkInsurancePlanLimit,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};
