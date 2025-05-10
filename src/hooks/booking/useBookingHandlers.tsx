
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { BookingData } from '@/hooks/booking/useBookingSteps';

interface UseBookingHandlersProps {
  setTeamMember: (teamMemberId: string) => void;
  setService: (serviceId: string) => void;
  setInsurance: (insuranceId: string) => void;
  setDate: (date: Date) => void;
  setTime: (startTime: string, endTime: string) => void;
  setClientInfo: (name: string, email: string, phone: string, notes?: string) => void;
  completeBooking: () => Promise<boolean>;
  refreshData: () => void;
}

export const useBookingHandlers = ({
  setTeamMember,
  setService,
  setInsurance,
  setDate,
  setTime,
  setClientInfo,
  completeBooking,
  refreshData
}: UseBookingHandlersProps) => {
  
  const handleTeamMemberChange = useCallback((teamMemberId: string) => {
    setTeamMember(teamMemberId);
  }, [setTeamMember]);
  
  const handleServiceChange = useCallback((serviceId: string) => {
    setService(serviceId);
  }, [setService]);
  
  const handleInsuranceChange = useCallback((insuranceId: string) => {
    setInsurance(insuranceId);
  }, [setInsurance]);
  
  const handleDateChange = useCallback((date: Date) => {
    setDate(date);
  }, [setDate]);
  
  const handleTimeChange = useCallback((startTime: string, endTime: string) => {
    setTime(startTime, endTime);
  }, [setTime]);
  
  const handleClientInfoSubmit = useCallback((name: string, email: string, phone: string, notes?: string) => {
    setClientInfo(name, email, phone, notes);
  }, [setClientInfo]);
  
  const handleCompleteBooking = useCallback(async () => {
    const success = await completeBooking();
    return success;
  }, [completeBooking]);
  
  const handleRefresh = useCallback(() => {
    refreshData();
    toast.info("Atualizando dados", {
      description: "Recarregando dados do sistema"
    });
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
