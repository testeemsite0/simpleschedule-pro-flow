
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseServiceSelectionProps {
  professionalId: string;
  teamMemberId?: string;
}

export const useServiceSelection = ({ professionalId, teamMemberId }: UseServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [memberServices, setMemberServices] = useState<{[key: string]: Service[]}>({});
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchServices();
  }, [professionalId]);
  
  useEffect(() => {
    if (teamMemberId && services.length > 0) {
      fetchTeamMemberServices(teamMemberId);
    }
  }, [teamMemberId, services]);
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('active', true);
        
      if (error) throw error;
      
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      });
    }
  };
  
  const fetchTeamMemberServices = async (memberId: string) => {
    try {
      const { data: memberServicesData, error } = await supabase
        .from('team_member_services')
        .select('*')
        .eq('team_member_id', memberId);
        
      if (error) throw error;
      
      // Group services by team member
      const servicesByMember: {[key: string]: Service[]} = {};
      
      if (memberServicesData && services.length > 0) {
        for (const memberService of memberServicesData) {
          const service = services.find(s => s.id === memberService.service_id);
          if (service) {
            if (!servicesByMember[memberService.team_member_id]) {
              servicesByMember[memberService.team_member_id] = [];
            }
            servicesByMember[memberService.team_member_id].push(service);
          }
        }
      }
      
      setMemberServices(servicesByMember);
      
      // Update available services for this team member
      const memberServicesList = servicesByMember[memberId] || [];
      setAvailableServices(
        memberServicesList.length > 0 ? memberServicesList : services
      );
    } catch (error) {
      console.error("Error fetching team member services:", error);
      setAvailableServices(services);
    }
  };
  
  return {
    services,
    memberServices,
    availableServices,
    serviceId,
    setServiceId
  };
};
