
import React, { createContext, useState } from 'react';
import { Appointment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import * as appointmentApi from '@/api/appointments/appointmentApi';
import * as timeSlotApi from '@/api/appointments/timeSlotApi';

// Define the context type explicitly, using imported functions
interface AppointmentContextType {
  // State
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  
  // API Functions - reexporting from the api modules
  getAppointmentsByProfessional: typeof appointmentApi.getAppointmentsByProfessional;
  getTimeSlotsByProfessional: typeof timeSlotApi.getTimeSlotsByProfessional;
  getTimeSlotsByTeamMember: typeof timeSlotApi.getTimeSlotsByTeamMember;
  addAppointment: (appointment: Appointment) => void;
  countMonthlyAppointments: typeof appointmentApi.countMonthlyAppointments;
  isWithinFreeLimit: typeof appointmentApi.isWithinFreeLimit;
  checkInsurancePlanLimit: typeof appointmentApi.checkInsurancePlanLimit;
  cancelAppointment: typeof appointmentApi.cancelAppointment;
  addTimeSlot: typeof timeSlotApi.addTimeSlot;
  updateTimeSlot: typeof timeSlotApi.updateTimeSlot;
  deleteTimeSlot: typeof timeSlotApi.deleteTimeSlot;
}

// Create the context with undefined initial value
export const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Export the hook from a separate file
export { useAppointments } from '@/hooks/useAppointments';

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Add new appointment to the state and database
  const addAppointment = (appointment: Appointment) => {
    setAppointments((prevAppointments) => [...prevAppointments, appointment]);
  };
  
  // Create the context value object with explicit typing
  const contextValue: AppointmentContextType = {
    appointments,
    setAppointments,
    getAppointmentsByProfessional: appointmentApi.getAppointmentsByProfessional,
    getTimeSlotsByProfessional: timeSlotApi.getTimeSlotsByProfessional,
    getTimeSlotsByTeamMember: timeSlotApi.getTimeSlotsByTeamMember,
    addAppointment,
    countMonthlyAppointments: appointmentApi.countMonthlyAppointments,
    isWithinFreeLimit: appointmentApi.isWithinFreeLimit,
    checkInsurancePlanLimit: appointmentApi.checkInsurancePlanLimit,
    cancelAppointment: appointmentApi.cancelAppointment,
    addTimeSlot: timeSlotApi.addTimeSlot,
    updateTimeSlot: timeSlotApi.updateTimeSlot,
    deleteTimeSlot: timeSlotApi.deleteTimeSlot,
  };
  
  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
};
