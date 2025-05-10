
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useBookingSteps, BookingStep, BookingData } from '@/hooks/booking/useBookingSteps';
import { useUnifiedBookingFlow } from '@/hooks/booking/useUnifiedBookingFlow';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';

// Define an interface for available time slots that matches what TimeStep component expects
interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface UnifiedBookingContextType {
  // Estado do agendamento
  currentStep: BookingStep;
  bookingData: BookingData;
  isLoading: boolean;
  error: string | null;
  maintenanceMode: boolean;
  
  // Dados
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  availableDates: Date[];
  availableSlots: AvailableSlot[];
  
  // Funções de navegação
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: BookingStep) => void;
  
  // Funções de atualização
  setTeamMember: (teamMember: TeamMember | string) => void;
  setService: (service: Service | string) => void;
  setInsurance: (insurance: InsurancePlan | string) => void;
  setDate: (date: Date) => void;
  setTime: (startTime: string, endTime: string) => void;
  setClientInfo: (name: string, email: string, phone: string, notes?: string) => void;
  
  // Ações
  completeBooking: () => Promise<boolean>;
  resetBooking: () => void;
  setMaintenanceMode: (enabled: boolean) => void;
  
  // Funções utilitárias
  getAvailableServicesForTeamMember: (teamMemberId: string) => Service[];
  checkInsuranceLimitReached: (insuranceId: string, teamMemberId?: string) => boolean;
}

const UnifiedBookingContext = createContext<UnifiedBookingContextType | undefined>(undefined);

interface UnifiedBookingProviderProps {
  children: ReactNode;
  professionalId?: string;
  isAdminView?: boolean;
  initialStep?: BookingStep;
}

export const UnifiedBookingProvider: React.FC<UnifiedBookingProviderProps> = ({
  children,
  professionalId,
  isAdminView = false,
  initialStep,
}) => {
  // Log when the provider mounts to help debug re-renders
  console.log("UnifiedBookingProvider mounted/updated with professionalId:", professionalId);
  
  const unifiedBookingFlow = useUnifiedBookingFlow({
    professionalId,
    isAdminView,
    initialStep
  });
  
  // Use useMemo to prevent unnecessary context value recreation
  const contextValue = useMemo(() => unifiedBookingFlow, [
    // List all dependencies that should trigger a context update
    unifiedBookingFlow.currentStep,
    unifiedBookingFlow.bookingData,
    unifiedBookingFlow.isLoading,
    unifiedBookingFlow.error,
    unifiedBookingFlow.teamMembers,
    unifiedBookingFlow.services,
    unifiedBookingFlow.insurancePlans,
    unifiedBookingFlow.availableDates,
    unifiedBookingFlow.availableSlots
  ]);

  return (
    <UnifiedBookingContext.Provider value={contextValue}>
      {children}
    </UnifiedBookingContext.Provider>
  );
};

export const useUnifiedBooking = () => {
  const context = useContext(UnifiedBookingContext);
  if (context === undefined) {
    throw new Error('useUnifiedBooking must be used within a UnifiedBookingProvider');
  }
  return context;
};
