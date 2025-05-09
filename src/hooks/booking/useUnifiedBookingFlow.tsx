
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useBookingSteps } from './useBookingSteps';
import { supabase } from '@/integrations/supabase/client';
import { Service, TeamMember, InsurancePlan, TimeSlot } from '@/types';
import { format } from 'date-fns';

interface UseUnifiedBookingFlowProps {
  professionalId?: string;
  isAdminView?: boolean;
}

export const useUnifiedBookingFlow = ({
  professionalId,
  isAdminView = false
}: UseUnifiedBookingFlowProps = {}) => {
  const bookingSteps = useBookingSteps();
  
  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!professionalId) return;
      
      try {
        const [
          teamMembersResult,
          servicesResult,
          insurancePlansResult,
          timeSlotsResult,
          appointmentsResult,
        ] = await Promise.all([
          supabase.from('team_members').select('*').eq('professional_id', professionalId).eq('active', true),
          supabase.from('services').select('*').eq('professional_id', professionalId).eq('active', true),
          supabase.from('insurance_plans').select('*').eq('professional_id', professionalId),
          supabase.from('time_slots').select('*').eq('professional_id', professionalId),
          supabase.from('appointments').select('*').eq('professional_id', professionalId),
        ]);
        
        setTeamMembers(teamMembersResult.data || []);
        setServices(servicesResult.data || []);
        setInsurancePlans(insurancePlansResult.data || []);
        setTimeSlots(timeSlotsResult.data || []);
        setAppointments(appointmentsResult.data || []);
        
        console.log("Unified booking: Data loaded with", 
          teamMembersResult.data?.length || 0, "team members",
          servicesResult.data?.length || 0, "services",
          timeSlotsResult.data?.length || 0, "time slots");
      } catch (error) {
        console.error("Error loading unified booking data:", error);
        toast.error("Erro ao carregar dados para agendamento");
      }
    };
    
    fetchInitialData();
  }, [professionalId]);
  
  // Filter available services for a team member
  const getAvailableServicesForTeamMember = (teamMemberId: string) => {
    return services.filter(() => true);
  };
  
  // Check if insurance limit reached
  const checkInsuranceLimitReached = (insuranceId: string) => {
    const insurance = insurancePlans.find(plan => plan.id === insuranceId);
    if (!insurance || !insurance.limit_per_plan) return false;
    return insurance.current_appointments >= insurance.limit_per_plan;
  };
  
  // Complete booking process
  const completeBooking = async () => {
    setIsLoading(true);
    const { bookingData } = bookingSteps;
    
    try {
      if (!bookingData.teamMemberId || !bookingData.date || 
          !bookingData.startTime || !bookingData.endTime ||
          !bookingData.clientName || !bookingData.clientEmail) {
        throw new Error("Dados incompletos para agendamento");
      }
      
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      
      const appointmentData = {
        professional_id: professionalId,
        team_member_id: bookingData.teamMemberId,
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail,
        client_phone: bookingData.clientPhone || '',
        date: formattedDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        notes: bookingData.notes || '',
        status: 'scheduled',
        source: isAdminView ? 'admin' : 'client',
        insurance_plan_id: bookingData.insuranceId === "none" ? null : bookingData.insuranceId || null,
        service_id: bookingData.serviceId || null
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("Agendamento realizado com sucesso!");
        bookingSteps.goToStep("confirmation");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      bookingSteps.updateErrorState(error.message || "Erro ao processar agendamento");
      toast.error(error.message || "Erro ao processar agendamento");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    ...bookingSteps,
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    availableDates,
    availableSlots,
    isLoading,
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached,
    completeBooking,
    setMaintenanceMode
  };
};
