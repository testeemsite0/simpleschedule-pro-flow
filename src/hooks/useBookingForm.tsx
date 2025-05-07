
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { TeamMember, Service, InsurancePlan, Professional } from '@/types';
import { useAppointments } from '@/context/AppointmentContext';

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
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Selection fields
  const [teamMemberId] = useState<string | undefined>(selectedTeamMember);
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  
  // Data and state
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [memberServices, setMemberServices] = useState<{[key: string]: Service[]}>({});
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState<InsurancePlan | null>(null);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState<InsurancePlan[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const { toast } = useToast();
  const { addAppointment } = useAppointments();

  // Fetch team members, services and insurance plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for booking form...");
        
        // Fetch team members
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (teamMembersError) throw teamMembersError;
        console.log("Team members fetched:", teamMembersData?.length || 0);
        setTeamMembers(teamMembersData || []);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (servicesError) throw servicesError;
        console.log("Services fetched:", servicesData?.length || 0);
        setServices(servicesData || []);
        
        // Fetch team member services
        if (teamMembersData && teamMembersData.length > 0) {
          const teamMemberIds = teamMembersData.map(member => member.id);
          
          const { data: memberServicesData, error: memberServicesError } = await supabase
            .from('team_member_services')
            .select('*')
            .in('team_member_id', teamMemberIds);
            
          if (memberServicesError) throw memberServicesError;
          console.log("Team member services fetched:", memberServicesData?.length || 0);
          
          // Group services by team member
          const servicesByMember: {[key: string]: Service[]} = {};
          
          if (memberServicesData && servicesData) {
            for (const memberService of memberServicesData) {
              const service = servicesData.find(s => s.id === memberService.service_id);
              if (service) {
                if (!servicesByMember[memberService.team_member_id]) {
                  servicesByMember[memberService.team_member_id] = [];
                }
                servicesByMember[memberService.team_member_id].push(service);
              }
            }
          }
          
          setMemberServices(servicesByMember);
        }
        
        // Fetch insurance plans
        const { data: insurancePlansData, error: insurancePlansError } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professional.id);
          
        if (insurancePlansError) throw insurancePlansError;
        console.log("Insurance plans fetched:", insurancePlansData?.length || 0);
        setInsurancePlans(insurancePlansData || []);
        
        // Fetch team member insurance plans
        if (teamMembersData && teamMembersData.length > 0) {
          const teamMemberIds = teamMembersData.map(member => member.id);
          
          // Get team member insurance plans
          const { data: memberInsurancePlans, error: planError } = await supabase
            .from('team_member_insurance_plans')
            .select(`
              id,
              team_member_id,
              insurance_plan_id,
              limit_per_member,
              current_appointments,
              created_at
            `)
            .in('team_member_id', teamMemberIds);
            
          if (planError) throw planError;
          console.log("Team member insurance plans fetched:", memberInsurancePlans?.length || 0);
          
          // If team member is pre-selected, load their available insurance plans
          if (selectedTeamMember) {
            updateAvailableInsurancePlans(selectedTeamMember, memberInsurancePlans, insurancePlansData || []);
            
            // Update available services for this team member
            const memberServicesList = memberServices[selectedTeamMember] || [];
            setAvailableServices(
              memberServicesList.length > 0 ? memberServicesList : (servicesData || [])
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive',
        });
      }
    };
    
    fetchData();
  }, [professional.id, toast, selectedTeamMember]);
  
  const updateAvailableInsurancePlans = (memberId: string, memberPlansData: any[] = [], allPlans: InsurancePlan[] = []) => {
    // Find all insurance plans available for this professional
    const memberPlans = memberPlansData.filter(
      plan => plan.team_member_id === memberId
    );
    
    if (memberPlans.length === 0) {
      setAvailableInsurancePlans([]);
      return;
    }
    
    // Prepare list of available insurance plans with availability information
    const availablePlans = memberPlans
      .map(memberPlan => {
        const planDetails = allPlans.find(p => p.id === memberPlan.insurance_plan_id);
        
        if (!planDetails) return null;
        
        // Check if seats are available for this professional and plan
        const isAvailable = memberPlan.limit_per_member === null || 
                          memberPlan.current_appointments < memberPlan.limit_per_member;
                    
        // Check if global plan limit is reached
        const isGlobalLimitReached = planDetails.limit_per_plan !== null && 
                                  planDetails.current_appointments >= planDetails.limit_per_plan;
        
        // Return an extended version of the plan with additional information
        return {
          ...planDetails,
          availableForBooking: isAvailable && !isGlobalLimitReached,
          memberPlanId: memberPlan.id,
          memberLimit: memberPlan.limit_per_member,
          memberCurrentAppointments: memberPlan.current_appointments
        } as InsurancePlan;
      })
      .filter((plan): plan is InsurancePlan => plan !== null);
    
    console.log("Available insurance plans updated:", availablePlans.length);
    setAvailableInsurancePlans(availablePlans);
  };
  
  const handleInsurancePlanChange = (value: string) => {
    console.log("Insurance plan selected:", value);
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    setCurrentStep(2); // Advance to the next step (client data)
    
    if (value === "none") {
      setSelectedInsurancePlan(null);
      return;
    }
    
    if (!teamMemberId) {
      setInsuranceLimitError("Você deve selecionar um profissional primeiro");
      return;
    }
    
    const plan = insurancePlans.find(p => p.id === value);
    setSelectedInsurancePlan(plan || null);
  };
  
  const validateClientInfo = () => {
    if (!name) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe seu nome completo',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!email) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe seu email',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateClientInfo()) return;
    
    // Check insurance plan limits
    if (insuranceLimitError) {
      toast({
        title: 'Limite de convênio atingido',
        description: insuranceLimitError,
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the date as YYYY-MM-DD for storage
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if an appointment with the same date and start_time already exists
      const { data: existingAppointment, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professional.id)
        .eq('date', formattedDate)
        .eq('start_time', startTime)
        .eq('status', 'scheduled');
      
      if (checkError) {
        throw checkError;
      }
      
      // If an appointment already exists, show an error
      if (existingAppointment && existingAppointment.length > 0) {
        toast({
          title: 'Horário indisponível',
          description: 'Este horário já foi reservado. Por favor, selecione outro horário.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Get price from selected service if available
      let price = null;
      if (serviceId) {
        const selectedService = services.find(s => s.id === serviceId);
        if (selectedService) {
          price = selectedService.price;
        }
      }
      
      // Define appointment status and source as literal types
      const appointmentStatus = 'scheduled' as const;
      const appointmentSource = 'client' as const;
      
      // Prepare appointment data
      const appointmentData = {
        professional_id: professional.id,
        client_name: name,
        client_email: email,
        client_phone: phone,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        status: appointmentStatus,
        source: appointmentSource,
        team_member_id: teamMemberId || null,
        insurance_plan_id: insurancePlanId === "none" ? null : insurancePlanId || null,
        service_id: serviceId || null,
        price: price,
      };
      
      console.log("Creating appointment with data:", appointmentData);
      
      // Create appointment and get its ID
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Appointment created successfully:", data[0]);
        
        // Ensure the appointment has the correct literal types
        const newAppointment = {
          ...data[0],
          status: appointmentStatus,
          source: appointmentSource
        };
        
        // Add the appointment to the context
        addAppointment(newAppointment);
        
        toast({
          title: 'Agendamento realizado',
          description: 'Seu agendamento foi confirmado com sucesso',
        });
        
        onSuccess(name, data[0].id);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: 'Erro ao agendar',
        description: 'Ocorreu um erro ao processar seu agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    setInsurancePlanId,
    
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
    onCancel
  };
};
