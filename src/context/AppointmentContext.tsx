import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentContextProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  getTimeSlotsByProfessional: (professionalId: string) => Promise<TimeSlot[]>;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  addTimeSlot: (timeSlotData: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTimeSlot: (timeSlotData: TimeSlot) => Promise<boolean>;
  deleteTimeSlot: (timeSlotId: string) => Promise<boolean>;
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
        .eq('professional_id', professionalId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      const fetchedAppointments = data as Appointment[];
      setAppointments(fetchedAppointments);
      return fetchedAppointments;
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
    
    try {
      // Free tier limit is 5 appointments per month
      // For public bookings, we'll allow up to 5 appointments per month
      return count < 5;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to allowing if we can't check subscription (fail-open)
      return true;
    }
  };
  
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newAppointment = data[0] as Appointment;
        setAppointments(prev => [...prev, newAppointment]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding appointment:', error);
      return false;
    }
  };
  
  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      // Atualizar estado local
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId 
            ? { ...app, status: 'canceled' } 
            : app
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return false;
    }
  };
  
  const addTimeSlot = async (timeSlotData: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .insert([timeSlotData]);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error adding time slot:', error);
      return false;
    }
  };
  
  const updateTimeSlot = async (timeSlotData: TimeSlot): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({
          day_of_week: timeSlotData.day_of_week,
          start_time: timeSlotData.start_time,
          end_time: timeSlotData.end_time,
          available: timeSlotData.available,
          appointment_duration_minutes: timeSlotData.appointment_duration_minutes,
          lunch_break_start: timeSlotData.lunch_break_start,
          lunch_break_end: timeSlotData.lunch_break_end
        })
        .eq('id', timeSlotData.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating time slot:', error);
      return false;
    }
  };
  
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
        countMonthlyAppointments,
        isWithinFreeLimit,
        addAppointment,
        cancelAppointment,
        addTimeSlot,
        updateTimeSlot,
        deleteTimeSlot
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
