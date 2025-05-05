
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Professional, TeamMember, InsurancePlan, TeamMemberInsurancePlan, Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppointments } from '@/context/AppointmentContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingFormProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
  selectedTeamMember?: string; // Pre-selected team member
}

const BookingForm: React.FC<BookingFormProps> = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  onSuccess,
  onCancel,
  selectedTeamMember
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Selection fields
  const [teamMemberId, setTeamMemberId] = useState<string | undefined>(selectedTeamMember);
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  
  // Data and state
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [memberServices, setMemberServices] = useState<{[key: string]: Service[]}>({}); // Services by team member
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [teamMemberInsurancePlans, setTeamMemberInsurancePlans] = useState<TeamMemberInsurancePlan[]>([]);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState<InsurancePlan | null>(null);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState<InsurancePlan[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  
  const { toast } = useToast();
  const { addAppointment } = useAppointments();
  
  const formattedDate = format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
  // Fetch team members, services and insurance plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (teamMembersError) throw teamMembersError;
        setTeamMembers(teamMembersData || []);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Fetch team member services
        if (teamMembersData && teamMembersData.length > 0) {
          const teamMemberIds = teamMembersData.map(member => member.id);
          
          const { data: memberServicesData, error: memberServicesError } = await supabase
            .from('team_member_services')
            .select('*')
            .in('team_member_id', teamMemberIds);
            
          if (memberServicesError) throw memberServicesError;
          
          // Group services by team member
          const servicesByMember: {[key: string]: Service[]} = {};
          
          if (memberServicesData) {
            for (const memberService of memberServicesData) {
              const service = servicesData?.find(s => s.id === memberService.service_id);
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
          
          // Get the actual insurance plans
          if (memberInsurancePlans && memberInsurancePlans.length > 0) {
            const insurancePlanIds = Array.from(new Set(
              memberInsurancePlans.map(plan => plan.insurance_plan_id)
            ));
            
            if (insurancePlanIds.length > 0) {
              const { data: plans, error: planDataError } = await supabase
                .from('insurance_plans')
                .select('*')
                .in('id', insurancePlanIds);
                
              if (planDataError) throw planDataError;
              
              // Merge the data
              const enrichedPlans = memberInsurancePlans.map(memberPlan => {
                const planDetails = plans?.find(plan => plan.id === memberPlan.insurance_plan_id);
                return {
                  ...memberPlan,
                  insurancePlan: planDetails
                };
              });
              
              setTeamMemberInsurancePlans(enrichedPlans as TeamMemberInsurancePlan[]);
            }
          }
        }
        
        // If team member is pre-selected, trigger the change handler
        if (selectedTeamMember) {
          handleTeamMemberChange(selectedTeamMember);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive',
        });
      }
    };
    
    fetchData();
  }, [professional.id, toast, selectedTeamMember]);
  
  const handleTeamMemberChange = (value: string) => {
    setTeamMemberId(value === "none" ? undefined : value);
    setInsurancePlanId(undefined); // Limpa a seleção de convênio quando o profissional muda
    setServiceId(undefined); // Limpa a seleção de serviço quando o profissional muda
    setInsuranceLimitError(null);
    
    if (value === "none") {
      setAvailableInsurancePlans([]);
      setAvailableServices(services);
      return;
    }
    
    // Update available services for this team member
    const memberServicesList = memberServices[value] || [];
    setAvailableServices(memberServicesList.length > 0 ? memberServicesList : services);
    
    // Encontra todos os convênios disponíveis para este profissional
    const memberPlans = teamMemberInsurancePlans.filter(
      plan => plan.team_member_id === value
    );
    
    if (memberPlans.length === 0) {
      setAvailableInsurancePlans([]);
      return;
    }
    
    // Prepara lista de convênios disponíveis com informações de disponibilidade
    const availablePlans = memberPlans
      .map(memberPlan => {
        const planDetails = insurancePlans.find(p => p.id === memberPlan.insurance_plan_id);
        
        if (!planDetails) return null;
        
        // Verifica se há vagas disponíveis para este profissional e convênio
        const isAvailable = memberPlan.limit_per_member === null || 
                           memberPlan.current_appointments < memberPlan.limit_per_member;
                     
        // Verifica se o limite global do plano foi atingido
        const isGlobalLimitReached = planDetails.limit_per_plan !== null && 
                                   planDetails.current_appointments >= planDetails.limit_per_plan;
        
        // Retorna uma versão estendida do plano com informações adicionais
        return {
          ...planDetails,
          availableForBooking: isAvailable && !isGlobalLimitReached,
          memberPlanId: memberPlan.id,
          memberLimit: memberPlan.limit_per_member,
          memberCurrentAppointments: memberPlan.current_appointments
        } as InsurancePlan;  // Explicitamente definimos como InsurancePlan
      })
      .filter((plan): plan is InsurancePlan => plan !== null);
    
    setAvailableInsurancePlans(availablePlans);
  };
  
  const handleInsurancePlanChange = (value: string) => {
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    if (value === "none") {
      setSelectedInsurancePlan(null);
      return;
    }
    
    if (!teamMemberId || teamMemberId === "none") {
      setInsuranceLimitError("Você deve selecionar um profissional primeiro");
      return;
    }
    
    const plan = insurancePlans.find(p => p.id === value);
    setSelectedInsurancePlan(plan || null);
    
    // Verifica limitações específicas para este convênio e profissional
    const memberPlan = teamMemberInsurancePlans.find(
      plan => plan.team_member_id === teamMemberId && plan.insurance_plan_id === value
    );
    
    if (!memberPlan) {
      setInsuranceLimitError(`O profissional selecionado não atende este convênio.`);
      return;
    }
    
    // Verifica limite específico do profissional
    if (memberPlan.limit_per_member !== null && memberPlan.current_appointments >= memberPlan.limit_per_member) {
      setInsuranceLimitError(`Este profissional atingiu o limite de atendimentos para este convênio.`);
      return;
    }
    
    // Verifica limite global do convênio
    if (plan && plan.limit_per_plan !== null && plan.current_appointments >= plan.limit_per_plan) {
      setInsuranceLimitError(`Este convênio atingiu o limite global de ${plan.limit_per_plan} agendamentos.`);
      return;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: 'Erro no formulário',
        description: 'Por favor, preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    
    // Check insurance plan limits
    if (insuranceLimitError) {
      toast({
        title: 'Limite de convênio atingido',
        description: insuranceLimitError,
        variant: 'destructive',
      });
      return;
    }
    
    // If insurance plan selected but no team member, show error
    if (insurancePlanId && insurancePlanId !== "none" && (!teamMemberId || teamMemberId === "none")) {
      toast({
        title: 'Profissional necessário',
        description: 'Você deve selecionar um profissional para este convênio',
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
      
      // If insurance plan selected, verify team member can accept it
      if (insurancePlanId && insurancePlanId !== "none" && teamMemberId && teamMemberId !== "none") {
        // Get the RPC function result
        const { data: canAccept, error: rpcError } = await supabase
          .rpc('can_team_member_accept_insurance', {
            member_id: teamMemberId,
            plan_id: insurancePlanId
          });
          
        if (rpcError) throw rpcError;
        
        if (!canAccept) {
          toast({
            title: 'Limite de convênio atingido',
            description: 'Este profissional não pode mais atender este convênio. Por favor, escolha outro profissional ou convênio.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
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
        team_member_id: teamMemberId === "none" ? null : teamMemberId || null,
        insurance_plan_id: insurancePlanId === "none" ? null : insurancePlanId || null,
        service_id: serviceId || null,
        price: price,
      };
      
      // Create appointment and get its ID
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
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
      console.error("Erro ao agendar:", error);
      toast({
        title: 'Erro ao agendar',
        description: 'Ocorreu um erro ao processar seu agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete seu agendamento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="bg-accent/30 p-3 rounded-md">
            <p className="font-medium">{professional.name}</p>
            <p className="text-sm">{formattedDate}</p>
            <p className="text-sm">{startTime} - {endTime}</p>
          </div>
          
          {/* Client information */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          {/* Step 1: Select team member */}
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">
                Profissional
              </Label>
              <Select 
                value={teamMemberId} 
                onValueChange={handleTeamMemberChange}
                disabled={!!selectedTeamMember} // Disable if pre-selected
              >
                <SelectTrigger id="teamMember">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem preferência específica</SelectItem>
                  
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.position ? `- ${member.position}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Step 2: Select service */}
          {availableServices.length > 0 && teamMemberId && teamMemberId !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Step 3: Select insurance plan (only if team member is selected) */}
          {teamMemberId && teamMemberId !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="insurancePlan">Convênio</Label>
              <Select value={insurancePlanId} onValueChange={handleInsurancePlanChange}>
                <SelectTrigger id="insurancePlan">
                  <SelectValue placeholder="Particular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Particular</SelectItem>
                  
                  {availableInsurancePlans.map(plan => {
                    const isAvailable = plan.availableForBooking !== false;
                    const limitInfo = plan.memberLimit 
                      ? `${plan.memberCurrentAppointments}/${plan.memberLimit}`
                      : plan.limit_per_plan
                        ? `${plan.current_appointments}/${plan.limit_per_plan}`
                        : '';
                    
                    return (
                      <SelectItem 
                        key={plan.id} 
                        value={plan.id}
                        disabled={!isAvailable}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.name}</span>
                          {limitInfo && (
                            <Badge 
                              variant={isAvailable ? "secondary" : "destructive"}
                              className="ml-2"
                            >
                              {limitInfo}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                  
                  {availableInsurancePlans.length === 0 && teamMemberId && teamMemberId !== "none" && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Este profissional não tem convênios disponíveis
                    </div>
                  )}
                </SelectContent>
              </Select>
                
              {insuranceLimitError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limite de convênio</AlertTitle>
                  <AlertDescription>
                    {insuranceLimitError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas ou motivo da consulta</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Forneça detalhes adicionais se necessário"
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Voltar
          </Button>
          <Button 
            type="submit" 
            disabled={
              isLoading || 
              !!insuranceLimitError || 
              (insurancePlanId && insurancePlanId !== "none" && (!teamMemberId || teamMemberId === "none"))
            }
          >
            {isLoading ? 'Enviando...' : 'Confirmar agendamento'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
