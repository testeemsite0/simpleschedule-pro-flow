
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, Professional } from '@/types';
import { useInsuranceSelection } from '@/hooks/booking/useInsuranceSelection';
import { useServiceSelection } from '@/hooks/booking/useServiceSelection';
import { useClientFormData } from '@/hooks/booking/useClientFormData';
import { useAppointmentCreation } from '@/hooks/booking/useAppointmentCreation';

interface UseBookingFormProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
}

export const useBookingForm = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  selectedTeamMember,
  onSuccess,
  onCancel
}: UseBookingFormProps) => {
  // Selection fields
  const [teamMemberId] = useState<string | undefined>(selectedTeamMember);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // Always start with step 2 (client info) when coming from calendar view
  const [currentStep, setCurrentStep] = useState<number>(2);
  
  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };
    
    fetchTeamMembers();
  }, [professional.id]);

  console.log("useBookingForm initialized with step:", currentStep);

  // Use the extracted hooks
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    notes, setNotes,
    validateClientInfo
  } = useClientFormData();

  const {
    insurancePlans,
    availableInsurancePlans,
    insurancePlanId,
    insuranceLimitError,
    handleInsurancePlanChange
  } = useInsuranceSelection({
    professionalId: professional.id,
    teamMemberId
  });

  const {
    services,
    availableServices,
    serviceId,
    setServiceId
  } = useServiceSelection({
    professionalId: professional.id,
    teamMemberId
  });

  const {
    isLoading,
    handleSubmit
  } = useAppointmentCreation({
    professionalId: professional.id,
    selectedDate,
    startTime,
    endTime,
    teamMemberId,
    serviceId,
    insurancePlanId,
    name,
    email,
    phone,
    notes,
    services,
    validateClientInfo,
    onSuccess
  });
  
  const handleNext = () => {
    handleInsurancePlanChange(insurancePlanId || "none");
  };
  
  const handlePrevious = () => {
    setCurrentStep(1);
  };

  return {
    // Form fields
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    
    // Selection fields
    teamMemberId,
    serviceId,
    setServiceId,
    insurancePlanId,
    
    // Data and state
    isLoading,
    teamMembers,
    services,
    insurancePlans,
    availableInsurancePlans,
    availableServices,
    insuranceLimitError,
    currentStep,
    setCurrentStep,
    
    // Handlers
    handleInsurancePlanChange,
    handleSubmit,
    onCancel,
    handleNext,
    handlePrevious
  };
};

