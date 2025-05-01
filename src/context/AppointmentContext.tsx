import React, { createContext, useContext, useState } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentContextProps {
  appointments: Appointment[];
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  getTimeSlotsByProfessional: (professionalId: string) => Promise<TimeSlot[]>;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
}

const AppointmentContext = createContext<AppointmentContextProps | undefined>(undefined);

interface AppointmentProviderProps {
  children: React.ReactNode;
}

export const AppointmentProvider = ({ children }: AppointmentProviderProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const getAppointmentsByProfessional = async (professionalId: string): Promise<Appointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professionalId);
        
      if (error) throw error;
      
      return data as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };
  
  const getTimeSlotsByProfessional = async (professionalId: string): Promise<TimeSlot[]> => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('professional_id', professionalId);
        
      if (error) throw error;
      
      return data as TimeSlot[];
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  };
  
  const countMonthlyAppointments = async (professionalId: string): Promise<number> => {
    // Get the first day of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    try {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', professionalId)
        .gte('date', startOfMonth.toISOString().split('T')[0]);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error counting monthly appointments:', error);
      return 0;
    }
  };
  
  const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
    const count = await countMonthlyAppointments(professionalId);
    
    // Check if user has an active subscription
    const { data: subscriptionData, error } = await supabase.functions.invoke('check-subscription', {
      method: 'POST',
      body: {},
    });
    
    if (error) {
      console.error('Error checking subscription:', error);
      // Default to allowing if we can't check subscription (fail-open)
      return true;
    }
    
    // If user has an active subscription, they're not limited
    if (subscriptionData.subscribed) {
      return true;
    }
    
    // Free tier limit is 5 appointments per month
    return count < 5;
  };
  
  return (
    <AppointmentContext.Provider 
      value={{ 
        appointments, 
        getAppointmentsByProfessional, 
        getTimeSlotsByProfessional,
        countMonthlyAppointments,
        isWithinFreeLimit
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
