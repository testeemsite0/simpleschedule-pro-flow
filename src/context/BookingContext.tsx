
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Professional, Appointment, TimeSlot } from '@/types';

interface BookingContextType {
  professional: Professional | null;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  currentStep: BookingStep;
  selectedDate: Date | null;
  selectedStartTime: string;
  selectedEndTime: string;
  selectedTeamMember: string | undefined;
  clientName: string;
  appointmentId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setProfessional: (professional: Professional | null) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setTimeSlots: (timeSlots: TimeSlot[]) => void;
  setCurrentStep: (step: BookingStep) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedStartTime: (time: string) => void;
  setSelectedEndTime: (time: string) => void;
  setSelectedTeamMember: (id: string | undefined) => void;
  setClientName: (name: string) => void;
  setAppointmentId: (id: string) => void;
}

export type BookingStep = 'calendar' | 'form' | 'confirmation';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const value = {
    professional,
    appointments,
    timeSlots,
    currentStep,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedTeamMember,
    clientName,
    appointmentId,
    loading,
    setProfessional,
    setAppointments,
    setTimeSlots,
    setCurrentStep,
    setSelectedDate,
    setSelectedStartTime,
    setSelectedEndTime,
    setSelectedTeamMember,
    setClientName,
    setAppointmentId,
    setLoading
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
