
import React, { createContext, useContext, ReactNode } from 'react';
import { useUnifiedBookingFlow } from '@/hooks/booking/useUnifiedBookingFlow';
import { BookingStep, BookingData } from '@/hooks/booking/useBookingSteps';
import { TeamMember, Service, InsurancePlan } from '@/types';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface UnifiedBookingContextType {
  // Step management
  currentStep: BookingStep;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: BookingStep) => void;
  
  // Data
  bookingData: BookingData;
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
  availableDates: Date[];
  availableSlots: AvailableSlot[];
  
  // State
  isLoading: boolean;
  error: string | null;
  maintenanceMode: boolean;
  resolvedProfessionalId?: string; // Add the missing property
  
  // Actions
  setTeamMember: (teamMemberId: string) => void;
  setService: (serviceId: string) => void;
  setInsurance: (insuranceId: string) => void;
  setDate: (date: Date) => void;
  setTime: (startTime: string, endTime: string) => void;
  setClientInfo: (name: string, email: string, phone?: string, notes?: string) => void;
  completeBooking: () => Promise<boolean>;
  resetBooking: () => void;
  
  // Utility functions
  getAvailableServicesForTeamMember: (teamMemberId: string) => Service[];
  checkInsuranceLimitReached: (insuranceId: string, teamMemberId: string) => boolean;
  refreshData: () => void;
}

const UnifiedBookingContext = createContext<UnifiedBookingContextType | undefined>(undefined);

interface UnifiedBookingProviderProps {
  children: ReactNode;
  professionalSlug?: string;
  professionalId?: string;
  isAdminView?: boolean;
}

export const UnifiedBookingProvider: React.FC<UnifiedBookingProviderProps> = ({ 
  children, 
  professionalSlug,
  professionalId,
  isAdminView = false 
}) => {
  console.log('UnifiedBookingProvider: Initializing with:', { 
    professionalSlug, 
    professionalId, 
    isAdminView 
  });

  // Fix: Pass the correct props to useUnifiedBookingFlow
  const unifiedBookingData = useUnifiedBookingFlow({
    professionalId,
    isAdminView,
    professionalSlug
  });

  // Debug the professional data loading
  React.useEffect(() => {
    console.log('UnifiedBookingProvider: Data update:', {
      teamMembersCount: unifiedBookingData.teamMembers?.length || 0,
      servicesCount: unifiedBookingData.services?.length || 0,
      isLoading: unifiedBookingData.isLoading,
      error: unifiedBookingData.error,
      professionalSlug,
      professionalId
    });
  }, [unifiedBookingData.teamMembers, unifiedBookingData.services, unifiedBookingData.isLoading, unifiedBookingData.error, professionalSlug, professionalId]);

  // Fix: Convert error to string and availableSlots to simple string array for the context
  const contextValue: UnifiedBookingContextType = {
    ...unifiedBookingData,
    error: typeof unifiedBookingData.error === 'string' ? unifiedBookingData.error : unifiedBookingData.error?.message || null,
    availableSlots: Array.isArray(unifiedBookingData.availableSlots) 
      ? unifiedBookingData.availableSlots
      : [],
    resolvedProfessionalId: professionalId // Add the resolved professional ID
  };

  return (
    <UnifiedBookingContext.Provider value={contextValue}>
      {children}
    </UnifiedBookingContext.Provider>
  );
};

export const useUnifiedBooking = (): UnifiedBookingContextType => {
  const context = useContext(UnifiedBookingContext);
  if (context === undefined) {
    throw new Error('useUnifiedBooking must be used within a UnifiedBookingProvider');
  }
  return context;
};
