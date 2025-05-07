
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, Service, InsurancePlan } from '@/types';

interface UseBookingCalendarDataProps {
  professionalId: string;
}

export const useBookingCalendarData = ({ professionalId }: UseBookingCalendarDataProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  
  // Fetch team members, services, and insurance plans
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching team members for professional:", professionalId);
        
        // Fetch team members
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (teamMembersError) {
          console.error("Error fetching team members:", teamMembersError);
          setError("Não foi possível carregar os profissionais");
          throw teamMembersError;
        }
        
        console.log("Team members loaded:", teamMembersData?.length || 0);
        setTeamMembers(teamMembersData || []);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (servicesError) {
          console.error("Error fetching services:", servicesError);
          setError("Não foi possível carregar os serviços");
          throw servicesError;
        }
        
        console.log("Services loaded:", servicesData?.length || 0);
        setServices(servicesData || []);
        
        // Fetch insurance plans
        const { data: insurancePlansData, error: insurancePlansError } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (insurancePlansError) {
          console.error("Error fetching insurance plans:", insurancePlansError);
          setError("Não foi possível carregar os convênios");
          throw insurancePlansError;
        }
        
        console.log("Insurance plans loaded:", insurancePlansData?.length || 0);
        setInsurancePlans(insurancePlansData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (professionalId) {
      fetchData();
    }
  }, [professionalId]);
  
  // Check appointment limits
  useEffect(() => {
    const checkAppointmentLimit = async () => {
      if (!professionalId) return;
      
      try {
        // Count current month's scheduled appointments
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { count, error } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: false })
          .eq('professional_id', professionalId)
          .eq('status', 'scheduled')
          .gte('date', firstDayOfMonth.toISOString().split('T')[0]);
          
        if (error) {
          console.error("Error checking appointment limit:", error);
          throw error;
        }

        setIsOverLimit(count !== null && count >= 5);
      } catch (error) {
        console.error("Error checking appointment limit:", error);
      }
    };
    
    checkAppointmentLimit();
  }, [professionalId]);

  return {
    teamMembers,
    services,
    insurancePlans,
    loading,
    error,
    isOverLimit
  };
};
