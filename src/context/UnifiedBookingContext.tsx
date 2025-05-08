import React, { createContext, useContext, ReactNode } from 'react';
import { useBookingSteps, BookingStep, BookingData } from '@/hooks/booking/useBookingSteps';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';

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
  availableDates: Date[]; // Adicionando esta propriedade
  availableSlots: TimeSlot[]; // Adicionando esta propriedade
  
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
  initialData?: {
    teamMembers?: TeamMember[];
    services?: Service[];
    insurancePlans?: InsurancePlan[];
    timeSlots?: TimeSlot[];
    appointments?: Appointment[];
  };
  initialStep?: BookingStep;
  onCompleteBooking?: (bookingData: BookingData) => Promise<void>;
}

export const UnifiedBookingProvider: React.FC<UnifiedBookingProviderProps> = ({
  children,
  initialData = {},
  initialStep,
  onCompleteBooking
}) => {
  const bookingSteps = useBookingSteps({ initialStep, onCompleteBooking });
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(initialData.teamMembers || []);
  const [services, setServices] = React.useState<Service[]>(initialData.services || []);
  const [insurancePlans, setInsurancePlans] = React.useState<InsurancePlan[]>(initialData.insurancePlans || []);
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>(initialData.timeSlots || []);
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialData.appointments || []);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [availableDates, setAvailableDates] = React.useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = React.useState<TimeSlot[]>([]);

  // Função utilitária para obter serviços disponíveis para um membro da equipe
  const getAvailableServicesForTeamMember = (teamMemberId: string) => {
    // Esta é uma implementação simplificada - na prática você pode precisar
    // consultar uma tabela de relação entre membros da equipe e serviços
    return services.filter(service => {
      // Aqui você pode adicionar uma lógica para verificar a associação entre o membro e o serviço
      return true; // Por enquanto, retornamos todos os serviços
    });
  };

  // Verificar se um plano de seguro atingiu seu limite
  const checkInsuranceLimitReached = (insuranceId: string, teamMemberId?: string) => {
    const insurance = insurancePlans.find(plan => plan.id === insuranceId);
    if (!insurance || !insurance.limit_per_plan) return false;
    
    // Verifique se o número atual de agendamentos para este plano atingiu o limite
    return insurance.current_appointments >= insurance.limit_per_plan;
  };

  // Atualiza os dados disponíveis para o contexto
  React.useEffect(() => {
    if (initialData.teamMembers) setTeamMembers(initialData.teamMembers);
    if (initialData.services) setServices(initialData.services);
    if (initialData.insurancePlans) setInsurancePlans(initialData.insurancePlans);
    if (initialData.timeSlots) setTimeSlots(initialData.timeSlots);
    if (initialData.appointments) setAppointments(initialData.appointments);
  }, [initialData]);

  const contextValue: UnifiedBookingContextType = {
    ...bookingSteps,
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    availableDates,
    availableSlots,
    setMaintenanceMode,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  };

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
