
import { useState } from 'react';
import { toast } from 'sonner';
import { Service, TeamMember, InsurancePlan } from '@/types';

export type BookingStep = 'team-member' | 'service' | 'insurance' | 'date' | 'time' | 'client-info' | 'confirmation';

interface UseBookingStepsProps {
  initialStep?: BookingStep;
  onCompleteBooking?: (bookingData: BookingData) => void;
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
  
  // Funções para avançar e voltar nas etapas
  const goToNextStep = () => {
    const stepOrder: BookingStep[] = ['team-member', 'service', 'insurance', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };
  
  const goToPreviousStep = () => {
    const stepOrder: BookingStep[] = ['team-member', 'service', 'insurance', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };
  
  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
  };
  
  // Funções para atualizar os dados de agendamento
  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({
      ...prev,
      ...data
    }));
  };
  
  const setTeamMember = (teamMember: TeamMember | string) => {
    const teamMemberId = typeof teamMember === 'string' ? teamMember : teamMember.id;
    updateBookingData({ teamMemberId });
    goToNextStep();
  };
  
  const setService = (service: Service | string) => {
    const serviceId = typeof service === 'string' ? service : service.id;
    updateBookingData({ serviceId });
    goToNextStep();
  };
  
  const setInsurance = (insurance: InsurancePlan | string) => {
    const insuranceId = typeof insurance === 'string' ? insurance : insurance.id;
    updateBookingData({ insuranceId });
    goToNextStep();
  };
  
  const setDate = (date: Date) => {
    updateBookingData({ date });
    goToNextStep();
  };
  
  const setTime = (startTime: string, endTime: string) => {
    updateBookingData({ startTime, endTime });
    goToNextStep();
  };
  
  const setClientInfo = (name: string, email: string, phone: string, notes?: string) => {
    updateBookingData({ 
      clientName: name, 
      clientEmail: email, 
      clientPhone: phone,
      notes: notes || '' 
    });
    goToNextStep();
  };
  
  const completeBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (onCompleteBooking) {
        await onCompleteBooking(bookingData);
      }
      
      toast.success("Agendamento realizado com sucesso!");
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
