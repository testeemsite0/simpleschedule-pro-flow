import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Professional, TeamMember, InsurancePlan, TeamMemberInsurancePlan } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppointments } from '@/context/AppointmentContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BookingFormProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [teamMemberId, setTeamMemberId] = useState<string | undefined>(undefined);
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [teamMemberInsurancePlans, setTeamMemberInsurancePlans] = useState<TeamMemberInsurancePlan[]>([]);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState<InsurancePlan | null>(null);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const [eligibleTeamMembers, setEligibleTeamMembers] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { addAppointment } = useAppointments();
  
  const formattedDate = format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
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
        console.error("Erro ao buscar membros da equipe:", error);
      }
    };
    
    const fetchInsurancePlans = async () => {
      try {
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professional.id);
          
        if (error) throw error;
        setInsurancePlans(data || []);
      } catch (error) {
        console.error("Erro ao buscar convênios:", error);
      }
    };
    
    const fetchTeamMemberInsurancePlans = async () => {
      try {
        // Get all team member IDs
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (teamError) throw teamError;
        
        if (teamMembers && teamMembers.length > 0) {
          const teamMemberIds = teamMembers.map(member => member.id);
          
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
      } catch (error) {
        console.error("Erro ao buscar convênios dos membros da equipe:", error);
      }
    };
    
    fetchTeamMembers();
    fetchInsurancePlans();
    fetchTeamMemberInsurancePlans();
  }, [professional.id]);
  
  // Filter eligible team members when insurance plan changes
  useEffect(() => {
    if (insurancePlanId && insurancePlanId !== "none") {
      // Find team members who can accept this insurance plan
      const eligibleMembers = teamMemberInsurancePlans
        .filter(plan => 
          plan.insurance_plan_id === insurancePlanId && 
          (plan.limit_per_member === null || plan.current_appointments < plan.limit_per_member)
        )
        .map(plan => plan.team_member_id);
      
      setEligibleTeamMembers(eligibleMembers);
      
      // If the currently selected team member is not eligible, clear it
      if (teamMemberId && !eligibleMembers.includes(teamMemberId)) {
        setTeamMemberId(undefined);
      }
    } else {
      // If no insurance selected or "none" selected, all team members are eligible
      setEligibleTeamMembers(teamMembers.map(member => member.id));
    }
  }, [insurancePlanId, teamMemberInsurancePlans, teamMembers]);
  
  const handleTeamMemberChange = (value: string) => {
    setTeamMemberId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    // If a team member is selected, check which insurance plans they can accept
    if (value !== "none" && insurancePlanId && insurancePlanId !== "none") {
      const memberPlan = teamMemberInsurancePlans.find(
        plan => plan.team_member_id === value && plan.insurance_plan_id === insurancePlanId
      );
      
      if (!memberPlan) {
        setInsuranceLimitError(`Este profissional não atende o convênio selecionado. Por favor, escolha outro profissional ou convênio.`);
        return;
      }
      
      // Check if member has reached their limit for this plan
      if (memberPlan.limit_per_member !== null && memberPlan.current_appointments >= memberPlan.limit_per_member) {
        setInsuranceLimitError(`Este profissional atingiu o limite de atendimentos para este convênio. Por favor, escolha outro profissional.`);
      }
    }
  };
  
  const handleInsurancePlanChange = (value: string) => {
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    
    if (value !== "none") {
      const plan = insurancePlans.find(p => p.id === value);
      setSelectedInsurancePlan(plan || null);
      
      // Check if the plan has reached its global limit
      if (plan && plan.limit_per_plan !== null && plan.current_appointments >= plan.limit_per_plan) {
        setInsuranceLimitError(`Este convênio atingiu o limite global de ${plan.limit_per_plan} agendamentos. Por favor, escolha outro convênio ou opção particular.`);
        return;
      }
      
      // If a team member is already selected, check if they can accept this plan
      if (teamMemberId && teamMemberId !== "none") {
        const memberPlan = teamMemberInsurancePlans.find(
          plan => plan.team_member_id === teamMemberId && plan.insurance_plan_id === value
        );
        
        if (!memberPlan) {
          setInsuranceLimitError(`O profissional selecionado não atende este convênio. Por favor, escolha outro profissional ou convênio.`);
          return;
        }
        
        // Check member-specific limit
        if (memberPlan.limit_per_member !== null && memberPlan.current_appointments >= memberPlan.limit_per_member) {
          setInsuranceLimitError(`O profissional selecionado atingiu o limite de atendimentos para este convênio. Por favor, escolha outro profissional.`);
        }
      }
    } else {
      setSelectedInsurancePlan(null);
    }
  };
  
  // Filter insurance plans based on which ones have eligible team members
  const getAvailableInsurancePlans = () => {
    // If no team member is selected, show all plans
    if (!teamMemberId || teamMemberId === "none") {
      return insurancePlans;
    }
    
    // Otherwise, show only plans accepted by this team member
    const memberPlanIds = teamMemberInsurancePlans
      .filter(plan => plan.team_member_id === teamMemberId)
      .map(plan => plan.insurance_plan_id);
    
    return insurancePlans.filter(plan => memberPlanIds.includes(plan.id));
  };
  
  const getEligibleTeamMembers = () => {
    return teamMembers.filter(member => 
      !insurancePlanId || 
      insurancePlanId === "none" || 
      eligibleTeamMembers.includes(member.id)
    );
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
  
  const availableInsurancePlans = getAvailableInsurancePlans();
  const eligibleMembers = getEligibleTeamMembers();
  
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
          
          <div className="space-y-2">
            <Label htmlFor="insurancePlan">Convênio</Label>
            <Select value={insurancePlanId} onValueChange={handleInsurancePlanChange}>
              <SelectTrigger id="insurancePlan">
                <SelectValue placeholder="Particular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Particular</SelectItem>
                {availableInsurancePlans.map(plan => {
                  const isGlobalLimitReached = plan.limit_per_plan !== null && 
                                             plan.current_appointments >= plan.limit_per_plan;
                                             
                  return (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      disabled={isGlobalLimitReached}
                    >
                      {plan.name} 
                      {isGlobalLimitReached 
                        ? ' (Limite global atingido)' 
                        : plan.limit_per_plan 
                          ? ` (${plan.current_appointments}/${plan.limit_per_plan})` 
                          : ''}
                    </SelectItem>
                  );
                })}
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
          
          {eligibleMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">
                Profissional de preferência
                {insurancePlanId && insurancePlanId !== "none" ? " *" : ""}
              </Label>
              <Select 
                value={teamMemberId} 
                onValueChange={handleTeamMemberChange}
              >
                <SelectTrigger id="teamMember">
                  <SelectValue placeholder={
                    insurancePlanId && insurancePlanId !== "none" 
                      ? "Selecione um profissional (obrigatório)" 
                      : "Selecione um profissional (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!insurancePlanId || insurancePlanId === "none" ? (
                    <SelectItem value="none">Sem preferência específica</SelectItem>
                  ) : null}
                  
                  {eligibleMembers.map(member => {
                    // For insurance plans, check if this member has a limit
                    let limitInfo = "";
                    if (insurancePlanId && insurancePlanId !== "none") {
                      const memberPlan = teamMemberInsurancePlans.find(
                        plan => plan.team_member_id === member.id && 
                              plan.insurance_plan_id === insurancePlanId
                      );
                      
                      if (memberPlan && memberPlan.limit_per_member !== null) {
                        limitInfo = ` (${memberPlan.current_appointments}/${memberPlan.limit_per_member})`;
                      }
                    }
                    
                    return (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} {member.position ? `- ${member.position}` : ''}{limitInfo}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {insurancePlanId && insurancePlanId !== "none" && !teamMemberId && (
                <p className="text-xs text-amber-600">
                  * Para convênios, a seleção de um profissional é obrigatória
                </p>
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
