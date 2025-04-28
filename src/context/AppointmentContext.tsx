
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Appointment, TimeSlot } from "../types";
import { appointments as mockAppointments, timeSlots as mockTimeSlots } from "../data/mockData";

interface AppointmentContextType {
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<boolean>;
  getAppointmentsByProfessional: (professionalId: string) => Appointment[];
  getTimeSlotsByProfessional: (professionalId: string) => TimeSlot[];
  updateTimeSlot: (timeSlot: TimeSlot) => Promise<boolean>;
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => Promise<boolean>;
  deleteTimeSlot: (id: string) => Promise<boolean>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(mockTimeSlots);
  
  const addAppointment = async (newAppointment: Omit<Appointment, 'id'>): Promise<boolean> => {
    const appointment: Appointment = {
      ...newAppointment,
      id: `${appointments.length + 1}`,
    };
    
    setAppointments([...appointments, appointment]);
    return true;
  };
  
  const cancelAppointment = async (id: string): Promise<boolean> => {
    setAppointments(
      appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: "canceled" } 
          : appointment
      )
    );
    return true;
  };
  
  const getAppointmentsByProfessional = (professionalId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.professionalId === professionalId);
  };
  
  const getTimeSlotsByProfessional = (professionalId: string): TimeSlot[] => {
    return timeSlots.filter(slot => slot.professionalId === professionalId);
  };
  
  const updateTimeSlot = async (updatedSlot: TimeSlot): Promise<boolean> => {
    setTimeSlots(
      timeSlots.map(slot => 
        slot.id === updatedSlot.id ? updatedSlot : slot
      )
    );
    return true;
  };
  
  const addTimeSlot = async (newSlot: Omit<TimeSlot, 'id'>): Promise<boolean> => {
    const timeSlot: TimeSlot = {
      ...newSlot,
      id: `${timeSlots.length + 1}`,
    };
    
    setTimeSlots([...timeSlots, timeSlot]);
    return true;
  };
  
  const deleteTimeSlot = async (id: string): Promise<boolean> => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    return true;
  };
  
  return (
    <AppointmentContext.Provider value={{
      appointments,
      timeSlots,
      addAppointment,
      cancelAppointment,
      getAppointmentsByProfessional,
      getTimeSlotsByProfessional,
      updateTimeSlot,
      addTimeSlot,
      deleteTimeSlot,
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
