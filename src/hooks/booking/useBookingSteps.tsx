
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
      setCurrentStep(stepOrder[currentIndex + 1]);
      console.log(`Moving from step ${currentStep} to ${stepOrder[currentIndex + 1]}`);
    }
  };
  
  const goToPreviousStep = () => {
    const stepOrder: BookingStep[] = ['team-member', 'insurance', 'service', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
      console.log(`Moving back from step ${currentStep} to ${stepOrder[currentIndex - 1]}`);
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
    updateBookingData({ teamMemberId });
    setCurrentStep('insurance'); // Go to insurance step first
  };
  
  const setInsurance = (insurance: InsurancePlan | string) => {
    const insuranceId = typeof insurance === 'string' ? insurance : insurance.id;
    updateBookingData({ insuranceId });
    setCurrentStep('service'); // Then go to service step
  };
  
  const setService = (service: Service | string) => {
    const serviceId = typeof service === 'string' ? service : service.id;
    updateBookingData({ serviceId });
    setCurrentStep('date'); // Then date selection
  };
  
  const setDate = (date: Date) => {
    updateBookingData({ date });
    setCurrentStep('time'); // Finally time selection
  };
  
  const setTime = (startTime: string, endTime: string) => {
    updateBookingData({ startTime, endTime });
    setCurrentStep('client-info'); // Next is client info
    console.log("Time selected, moving to client-info step");
  };
  
  const setClientInfo = (name: string, email: string, phone: string, notes?: string) => {
    updateBookingData({ 
      clientName: name, 
      clientEmail: email, 
      clientPhone: phone,
      notes: notes || '' 
    });
    console.log("Client info set:", { name, email, phone });
  };
  
  const completeBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (onCompleteBooking) {
        await onCompleteBooking(bookingData);
      }
      
      toast.success("Agendamento realizado com sucesso!");
      setCurrentStep('confirmation');
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
