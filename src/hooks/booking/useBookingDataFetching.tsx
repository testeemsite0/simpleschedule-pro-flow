
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, TeamMember, InsurancePlan, TimeSlot, Appointment } from '@/types';
import { toast } from 'sonner';

interface UseBookingDataFetchingProps {
  professionalId?: string;
}

export const useBookingDataFetching = ({
  professionalId
}: UseBookingDataFetchingProps = {}) => {
  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!professionalId) {
        console.error("No professional ID provided for booking flow");
        setIsLoading(false);
        return;
      }
      
      console.log("Booking data fetching: Fetching data for professional ID:", professionalId);
      setIsLoading(true);
      setDataError(null);
      
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
        
        // Check for errors in any of the queries
        const errorResults = [
          { name: 'team members', result: teamMembersResult },
          { name: 'services', result: servicesResult },
          { name: 'insurance plans', result: insurancePlansResult },
          { name: 'time slots', result: timeSlotsResult },
          { name: 'appointments', result: appointmentsResult }
        ];
        
        const errors = errorResults.filter(item => item.result.error);
        if (errors.length > 0) {
          const errorMessage = errors.map(e => `Error loading ${e.name}: ${e.result.error?.message}`).join('; ');
          console.error("Data loading errors:", errorMessage);
          setDataError(`Erro ao carregar dados: ${errorMessage}`);
          toast.error("Erro ao carregar dados para agendamento");
        }
        
        // Always set data even if some queries failed, to avoid complete UI breakage
        setTeamMembers(teamMembersResult.data || []);
        setServices(servicesResult.data || []);
        setInsurancePlans(insurancePlansResult.data || []);
        setTimeSlots(timeSlotsResult.data || []);
        
        // Type assertion to ensure appointment status is one of the allowed values
        if (appointmentsResult.data) {
          const typedAppointments = appointmentsResult.data.map(appointment => {
            // Ensure status is one of the allowed types
            const status = ['scheduled', 'completed', 'canceled'].includes(appointment.status) 
              ? appointment.status as 'scheduled' | 'completed' | 'canceled' 
              : 'scheduled'; // Default to 'scheduled' if invalid status
            
            return {
              ...appointment,
              status
            } as Appointment;
          });
          
          setAppointments(typedAppointments);
        } else {
          setAppointments([]);
        }
        
        console.log("Booking data fetching: Data loaded with", 
          teamMembersResult.data?.length || 0, "team members",
          servicesResult.data?.length || 0, "services",
          timeSlotsResult.data?.length || 0, "time slots");
          
        // Special logging for team members to help debug
        if (teamMembersResult.data && teamMembersResult.data.length === 0) {
          console.warn("No team members found for professional ID:", professionalId);
        } else {
          console.log("Team members loaded:", teamMembersResult.data);
        }
      } catch (error) {
        console.error("Error loading unified booking data:", error);
        setDataError("Erro ao carregar dados para agendamento");
        toast.error("Erro ao carregar dados para agendamento");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (professionalId) {
      fetchInitialData();
    } else {
      setIsLoading(false);
    }
  }, [professionalId]);

  return {
    teamMembers,
    services,
    insurancePlans,
    timeSlots,
    appointments,
    maintenanceMode,
    setMaintenanceMode,
    isLoading,
    dataError
  };
};
