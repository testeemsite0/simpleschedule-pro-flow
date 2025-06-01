
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseBookingHandlersProps {
  setTeamMember: (teamMemberId: string) => void;
  setService: (serviceId: string) => void;
  setInsurance: (insuranceId: string) => void;
  setDate: (date: Date) => void;
  setTime: (startTime: string, endTime: string) => void;
  setClientInfo: (name: string, email: string, phone?: string, notes?: string) => void;
  completeBooking: () => Promise<boolean>;
  refreshData: () => void;
  goToNextStep: () => void;
}

export const useBookingHandlers = ({
  setTeamMember,
  setService,
  setInsurance,
  setDate,
  setTime,
  setClientInfo,
  completeBooking,
  refreshData,
  goToNextStep
}: UseBookingHandlersProps) => {

  const handleTeamMemberChange = useCallback((teamMemberId: string) => {
    console.log(`useBookingHandlers: Team member selected: ${teamMemberId}`);
    setTeamMember(teamMemberId);
    
    // Auto-advance to next step after team member selection
    console.log(`useBookingHandlers: Auto-advancing to service selection step`);
    setTimeout(() => {
      goToNextStep();
    }, 300); // Small delay for better UX
  }, [setTeamMember, goToNextStep]);

  const handleServiceChange = useCallback((serviceId: string) => {
    console.log(`useBookingHandlers: Service selected: ${serviceId}`);
    setService(serviceId);
    
    // Auto-advance to next step after service selection
    console.log(`useBookingHandlers: Auto-advancing to insurance selection step`);
    setTimeout(() => {
      goToNextStep();
    }, 300); // Small delay for better UX
  }, [setService, goToNextStep]);

  const handleInsuranceChange = useCallback((insuranceId: string) => {
    console.log(`useBookingHandlers: Insurance selected: ${insuranceId}`);
    setInsurance(insuranceId);
    
    // Auto-advance to next step after insurance selection
    console.log(`useBookingHandlers: Auto-advancing to date selection step`);
    setTimeout(() => {
      goToNextStep();
    }, 300); // Small delay for better UX
  }, [setInsurance, goToNextStep]);

  const handleDateChange = useCallback((date: Date) => {
    console.log(`useBookingHandlers: Date selected: ${date.toISOString()}`);
    setDate(date);
    // Note: No auto-advance for date - user needs to manually proceed to time selection
  }, [setDate]);

  const handleTimeChange = useCallback((startTime: string, endTime: string) => {
    console.log(`useBookingHandlers: Time selected: ${startTime} - ${endTime}`);
    setTime(startTime, endTime);
    // Note: No auto-advance for time - user needs to manually proceed to client info
  }, [setTime]);

  const handleClientInfoSubmit = useCallback((name: string, email: string, phone?: string, notes?: string) => {
    console.log(`useBookingHandlers: Client info submitted - Name: "${name}", Email: "${email}", Phone: "${phone}"`);
    
    // Validate required fields
    if (!name || !name.trim()) {
      console.error("useBookingHandlers: Name is required but was empty");
      toast.error("Nome é obrigatório");
      return;
    }
    
    if (!email || !email.trim()) {
      console.error("useBookingHandlers: Email is required but was empty");
      toast.error("Email é obrigatório");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("useBookingHandlers: Invalid email format");
      toast.error("Email em formato inválido");
      return;
    }
    
    console.log("useBookingHandlers: Client info validation passed, saving data");
    setClientInfo(name.trim(), email.trim(), phone?.trim(), notes?.trim());
    
    toast.success("Informações do cliente salvas com sucesso!");
    
    // Auto-advance to confirmation step after client info is saved
    console.log(`useBookingHandlers: Auto-advancing to confirmation step`);
    setTimeout(() => {
      goToNextStep();
    }, 500); // Slightly longer delay to show success message
  }, [setClientInfo, goToNextStep]);

  const handleCompleteBooking = useCallback(async () => {
    console.log("useBookingHandlers: Starting booking completion process");
    
    try {
      const success = await completeBooking();
      
      if (success) {
        console.log("useBookingHandlers: Booking completed successfully");
        toast.success("Agendamento realizado com sucesso!");
      } else {
        console.error("useBookingHandlers: Booking completion failed");
        toast.error("Erro ao finalizar agendamento");
      }
      
      return success;
    } catch (error) {
      console.error("useBookingHandlers: Booking completion error:", error);
      toast.error("Erro ao finalizar agendamento");
      return false;
    }
  }, [completeBooking]);

  const handleRefresh = useCallback(() => {
    console.log("useBookingHandlers: Refreshing data");
    refreshData();
  }, [refreshData]);

  return {
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateChange,
    handleTimeChange,
    handleClientInfoSubmit,
    handleCompleteBooking,
    handleRefresh
  };
};
