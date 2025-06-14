
import React, { createContext, useState } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { useAuth } from '@/context/AuthContext';
import * as appointmentApi from '@/api/appointments/appointmentApi';
import * as timeSlotApi from '@/api/appointments/timeSlotApi';

// Define function signature types to avoid circular references
type GetAppointmentsFn = (professionalId: string) => Promise<Appointment[]>;
type GetTimeSlotsByProfessionalFn = (professionalId: string) => Promise<TimeSlot[]>;
type GetTimeSlotsByTeamMemberFn = (teamMemberId: string) => Promise<TimeSlot[]>;
type CountMonthlyAppointmentsFn = (professionalId: string) => Promise<number>;
type IsWithinFreeLimitFn = (professionalId: string) => Promise<boolean>;
type CheckInsurancePlanLimitFn = (planId: string) => Promise<boolean>;
type CancelAppointmentFn = (appointmentId: string) => Promise<boolean>;
type AddTimeSlotFn = (timeSlot: Omit<TimeSlot, "id">) => Promise<boolean>;
// Fixed: Update to match actual implementation in timeSlotApi
type UpdateTimeSlotFn = (timeSlot: TimeSlot) => Promise<boolean>;
type DeleteTimeSlotFn = (id: string) => Promise<boolean>;

// Define the context type explicitly, using the function signature types
interface AppointmentContextType {
  // State
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  
  // API Functions - using explicit function signatures
  getAppointmentsByProfessional: GetAppointmentsFn;
  getTimeSlotsByProfessional: GetTimeSlotsByProfessionalFn;
  getTimeSlotsByTeamMember: GetTimeSlotsByTeamMemberFn;
  addAppointment: (appointment: Appointment) => void;
  countMonthlyAppointments: CountMonthlyAppointmentsFn;
  isWithinFreeLimit: IsWithinFreeLimitFn;
  checkInsurancePlanLimit: CheckInsurancePlanLimitFn;
  cancelAppointment: CancelAppointmentFn;
  addTimeSlot: AddTimeSlotFn;
  updateTimeSlot: UpdateTimeSlotFn;
  deleteTimeSlot: DeleteTimeSlotFn;
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
