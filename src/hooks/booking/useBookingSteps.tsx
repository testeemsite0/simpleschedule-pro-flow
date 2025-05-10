
import { useState } from 'react';
import { toast } from 'sonner';
import { Service, TeamMember, InsurancePlan } from '@/types';

export type BookingStep = 'team-member' | 'insurance' | 'service' | 'date' | 'time' | 'client-info' | 'confirmation';

interface UseBookingStepsProps {
  initialStep?: BookingStep;
  onCompleteBooking?: (bookingData: BookingData) => Promise<void>;
}

export interface BookingData {
  teamMemberId?: string;
  serviceId?: string;
  insuranceId?: string;
  date?: Date | null;
  startTime?: string;
  endTime?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  appointmentId?: string;
  professionalName?: string;
}

export const useBookingSteps = ({ 
  initialStep = 'team-member',
  onCompleteBooking 
}: UseBookingStepsProps = {}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Functions for navigating steps - correct order: team-member → insurance → service → date → time → client-info → confirmation
  const goToNextStep = () => {
    const stepOrder: BookingStep[] = ['team-member', 'insurance', 'service', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      console.log(`Moving from step ${currentStep} to ${nextStep}`);
    }
  };
  
  const goToPreviousStep = () => {
    const stepOrder: BookingStep[] = ['team-member', 'insurance', 'service', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);
      console.log(`Moving back from step ${currentStep} to ${prevStep}`);
    }
  };
  
  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
    console.log(`Directly setting step to ${step}`);
  };
  
  // Functions for updating booking data
  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({
      ...prev,
      ...data
    }));
    console.log("Updated booking data:", {...bookingData, ...data});
  };
  
  const updateErrorState = (errorMessage: string | null) => {
    setError(errorMessage);
    if (errorMessage) {
      console.error("Booking error:", errorMessage);
    }
  };
  
  const setTeamMember = (teamMember: TeamMember | string) => {
    const teamMemberId = typeof teamMember === 'string' ? teamMember : teamMember.id;
    const professionalName = typeof teamMember === 'string' ? undefined : teamMember.name;
    updateBookingData({ teamMemberId, professionalName });
    setCurrentStep('insurance'); // Go to insurance step first
    console.log(`Team member set to ${teamMemberId}, moving to insurance step`);
  };
  
  const setInsurance = (insurance: InsurancePlan | string) => {
    const insuranceId = typeof insurance === 'string' ? insurance : insurance.id;
    updateBookingData({ insuranceId });
    setCurrentStep('service'); // Then go to service step
    console.log(`Insurance set to ${insuranceId}, moving to service step`);
  };
  
  const setService = (service: Service | string) => {
    const serviceId = typeof service === 'string' ? service : service.id;
    updateBookingData({ serviceId });
    setCurrentStep('date'); // Then date selection, fixed from 'time'
    console.log(`Service set to ${serviceId}, moving to date step`);
  };
  
  const setDate = (date: Date) => {
    updateBookingData({ date });
    setCurrentStep('time'); // Then time selection
    console.log(`Date selected: ${date.toISOString().split('T')[0]}, moving to time step`);
  };
  
  const setTime = (startTime: string, endTime: string) => {
    updateBookingData({ startTime, endTime });
    setCurrentStep('client-info'); // Next is client info
    console.log(`Time selected: ${startTime}-${endTime}, moving to client-info step`);
  };
  
  const setClientInfo = (name: string, email: string, phone: string, notes?: string) => {
    updateBookingData({ 
      clientName: name, 
      clientEmail: email, 
      clientPhone: phone,
      notes: notes || '' 
    });
    setCurrentStep('confirmation'); // Move to confirmation step
    console.log("Client info set:", { name, email, phone }, "moving to confirmation step");
  };
  
  const completeBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (onCompleteBooking) {
        await onCompleteBooking(bookingData);
      }
      
      toast.success("Agendamento realizado com sucesso!");
      
      // Generate a mock appointment ID for testing/display purposes
      const appointmentId = `appt-${Date.now().toString(36)}`;
      updateBookingData({ appointmentId });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao finalizar agendamento";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetBooking = () => {
    setBookingData({});
    setCurrentStep(initialStep);
    setError(null);
    console.log("Booking reset to initial state");
  };
  
  return {
    currentStep,
    bookingData,
    isLoading,
    error,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateBookingData,
    updateErrorState,
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    completeBooking,
    resetBooking
  };
};
