
import React, { createContext, useContext, ReactNode } from "react";
import { Appointment, TimeSlot } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentContextType {
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<boolean>;
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  getTimeSlotsByProfessional: (professionalId: string) => Promise<TimeSlot[]>;
  updateTimeSlot: (timeSlot: TimeSlot) => Promise<boolean>;
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => Promise<boolean>;
  deleteTimeSlot: (id: string) => Promise<boolean>;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const addAppointment = async (newAppointment: Omit<Appointment, 'id'>): Promise<boolean> => {
    const { error } = await supabase
      .from('appointments')
      .insert([newAppointment]);
    
    return !error;
  };
  
  const cancelAppointment = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id);
    
    return !error;
  };
  
  const getAppointmentsByProfessional = async (professionalId: string): Promise<Appointment[]> => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)
      .order('date', { ascending: true });
    
    return data as Appointment[] || [];
  };
  
  const getTimeSlotsByProfessional = async (professionalId: string): Promise<TimeSlot[]> => {
    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    return data as TimeSlot[] || [];
  };
  
  const updateTimeSlot = async (timeSlot: TimeSlot): Promise<boolean> => {
    const { error } = await supabase
      .from('time_slots')
      .update(timeSlot)
      .eq('id', timeSlot.id);
    
    return !error;
  };
  
  const addTimeSlot = async (newSlot: Omit<TimeSlot, 'id'>): Promise<boolean> => {
    const { error } = await supabase
      .from('time_slots')
      .insert([newSlot]);
    
    return !error;
  };
  
  const deleteTimeSlot = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id);
    
    return !error;
  };

  // Count active appointments for the current month for a professional
  const countMonthlyAppointments = async (professionalId: string): Promise<number> => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: false })
      .eq('professional_id', professionalId)
      .eq('status', 'scheduled')
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error("Error counting monthly appointments:", error);
      return 0;
    }

    return count || 0;
  };

  // Check if professional is within free plan limits (5 appointments/month)
  const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
    const count = await countMonthlyAppointments(professionalId);
    return count < 5; // Free plan allows up to 5 appointments per month
  };
  
  return (
    <AppointmentContext.Provider value={{
      appointments: [], // Now using async functions instead
      timeSlots: [], // Now using async functions instead
      addAppointment,
      cancelAppointment,
      getAppointmentsByProfessional,
      getTimeSlotsByProfessional,
      updateTimeSlot,
      addTimeSlot,
      deleteTimeSlot,
      countMonthlyAppointments,
      isWithinFreeLimit,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
};
