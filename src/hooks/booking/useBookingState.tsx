
import { useState } from 'react';
import { BookingData } from './useBookingSteps';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';

export const useBookingState = () => {
  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const updateState = (newState: {
    teamMembers?: TeamMember[];
    services?: Service[];
    insurancePlans?: InsurancePlan[];
    timeSlots?: TimeSlot[];
    appointments?: Appointment[];
    availableDates?: Date[];
    availableSlots?: any[];
    isLoading?: boolean;
  }) => {
    if (newState.teamMembers !== undefined) setTeamMembers(newState.teamMembers);
    if (newState.services !== undefined) setServices(newState.services);
    if (newState.insurancePlans !== undefined) setInsurancePlans(newState.insurancePlans);
    if (newState.timeSlots !== undefined) setTimeSlots(newState.timeSlots);
    if (newState.appointments !== undefined) setAppointments(newState.appointments);
    if (newState.availableDates !== undefined) setAvailableDates(newState.availableDates);
    if (newState.availableSlots !== undefined) setAvailableSlots(newState.availableSlots);
    if (newState.isLoading !== undefined) setIsLoading(newState.isLoading);
  };

  return {
    // States
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    availableDates,
    availableSlots,
    isLoading,
    
    // Update function
    updateState,
    
    // Individual setters
    setTeamMembers,
    setServices,
    setInsurancePlans,
    setTimeSlots,
    setAppointments,
    setAvailableDates,
    setAvailableSlots,
    setIsLoading
  };
};
