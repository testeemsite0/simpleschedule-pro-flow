
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlot, Appointment, TeamMember, InsurancePlan, TeamMemberInsurancePlan, Service } from '@/types';
import { format } from 'date-fns';
import { timeToMinutes, minutesToTime, doTimeSlotsOverlap } from '../booking/timeUtils';
import DateSelector from '../booking/DateSelector';
import TimeSlotSelector from '../booking/TimeSlotSelector';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppointmentCreationFormProps {
  professionalId: string;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: {
    selectedDate: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
    teamMemberId?: string;
    insurancePlanId?: string;
    serviceId?: string; // Adicionado campo de serviço
  }) => void;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

const AppointmentCreationForm: React.FC<AppointmentCreationFormProps> = ({
  professionalId,
  timeSlots,
  appointments,
  isSubmitting,
  onCancel,
  onSubmit
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailableSlot | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [teamMemberId, setTeamMemberId] = useState<string | undefined>(undefined);
  const [serviceId, setServiceId] = useState<string | undefined>(undefined); // Estado para serviço
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]); // Estado para serviços
  const [memberServices, setMemberServices] = useState<{[key: string]: Service[]}>({});
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [teamMemberInsurancePlans, setTeamMemberInsurancePlans] = useState<TeamMemberInsurancePlan[]>([]);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState<InsurancePlan[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]); // Serviços disponíveis
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Busca membros da equipe e planos de seguro
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (error) throw error;
        console.log("Team members fetched:", data?.length || 0);
        setTeamMembers(data || []);
      } catch (error) {
        console.error("Erro ao buscar membros da equipe:", error);
      }
    };
    
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (error) throw error;
        console.log("Services fetched:", data?.length || 0);
        setServices(data || []);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      }
    };
    
    const fetchInsurancePlans = async () => {
      try {
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (error) throw error;
        setInsurancePlans(data || []);
      } catch (error) {
        console.error("Erro ao buscar convênios:", error);
      }
    };
    
    const fetchTeamMemberInsurancePlans = async () => {
      try {
        // Obtém todos os IDs de membros da equipe
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (teamError) throw teamError;
        
        if (teamMembers && teamMembers.length > 0) {
          const teamMemberIds = teamMembers.map(member => member.id);
          
          // Obtém planos de seguro de membros da equipe
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
          
          // Obtém os planos de seguro reais
          if (memberInsurancePlans && memberInsurancePlans.length > 0) {
            const insurancePlanIds = Array.from(new Set(
              memberInsurancePlans.map(plan => plan.insurance_plan_id)
            ));
            
            const { data: plans, error: planDataError } = await supabase
              .from('insurance_plans')
              .select('*')
              .in('id', insurancePlanIds);
              
            if (planDataError) throw planDataError;
            
            // Mescla os dados
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
    
    const fetchTeamMemberServices = async () => {
      try {
        // Obtém todos os IDs de membros da equipe
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (teamError) throw teamError;
        
        if (teamMembers && teamMembers.length > 0) {
          const teamMemberIds = teamMembers.map(member => member.id);
          
          // Obtém serviços de membros da equipe
          const { data: memberServicesData, error: servicesError } = await supabase
            .from('team_member_services')
            .select('*')
            .in('team_member_id', teamMemberIds);
            
          if (servicesError) throw servicesError;
          
          // Obtém os dados completos dos serviços
          const { data: servicesData, error: servicesDataError } = await supabase
            .from('services')
            .select('*')
            .eq('professional_id', professionalId)
            .eq('active', true);
            
          if (servicesDataError) throw servicesDataError;
          
          // Mescla os dados
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
      } catch (error) {
        console.error("Erro ao buscar serviços dos membros da equipe:", error);
      }
    };
    
    fetchTeamMembers();
    fetchServices();
    fetchInsurancePlans();
    fetchTeamMemberInsurancePlans();
    fetchTeamMemberServices();
  }, [professionalId]);
  
  // Gera datas disponíveis para seleção com base em slots de tempo
  useEffect(() => {
    if (!teamMemberId || !serviceId) { // Agora requer serviceId também
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Filtra slots de tempo por membro da equipe selecionado
    const memberTimeSlots = timeSlots.filter(
      slot => slot.team_member_id === teamMemberId && slot.available
    );
    
    // Encontra todas as datas únicas nos próximos 14 dias que têm slots disponíveis
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // Pula datas antes de hoje
      if (date < now) continue;
      
      const dayOfWeek = date.getDay();
      
      // Verifica se há slots disponíveis para este dia da semana
      const hasAvailableSlots = memberTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek
      );
      
      if (hasAvailableSlots) {
        dates.push(new Date(date));
      }
    }
    
    setAvailableDates(dates);
    
    // Seleciona automaticamente a primeira data, se disponível
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(new Date(dates[0]));
    }
  }, [timeSlots, teamMemberId, selectedDate, serviceId]); // Adiciona serviceId às dependências
  
  // Gera slots de tempo disponíveis para a data selecionada
  useEffect(() => {
    if (!selectedDate || !teamMemberId || !serviceId) { // Agora requer serviceId também
      setAvailableSlots([]);
      return;
    }
    
    // Cria uma cópia nova da data para evitar problemas de referência
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Obtém todos os slots para este dia para o membro da equipe selecionado
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      slot.available &&
      slot.team_member_id === teamMemberId
    );
    
    // Formata a data selecionada para comparação com o banco de dados
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Obtém todos os slots reservados para esta data
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && 
      app.status === 'scheduled' &&
      app.team_member_id === teamMemberId
    );
    
    // Converte-os em slots de agendamento
    const slots: AvailableSlot[] = [];
    const now = new Date();
    
    daySlotsData.forEach(slot => {
      // Converte tempos para minutos para facilitar o cálculo
      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Lida com pausas para almoço se presentes
      const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
      
      // Gera slots
      for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
        // Pula slots que se sobrepõem com a pausa para almoço
        if (
          lunchStartMinutes !== null && 
          lunchEndMinutes !== null && 
          ((time < lunchEndMinutes && time + duration > lunchStartMinutes) || 
           (time >= lunchStartMinutes && time < lunchEndMinutes))
        ) {
          continue;
        }
        
        const startTime = minutesToTime(time);
        const endTime = minutesToTime(time + duration);
        
        // Verifica se o slot já está reservado
        const isOverlapping = bookedAppointments.some(app => {
          return doTimeSlotsOverlap(
            startTime, 
            endTime, 
            app.start_time, 
            app.end_time
          );
        });
        
        // Só adiciona se não estiver reservado
        if (!isOverlapping) {
          slots.push({
            date: new Date(date),
            startTime,
            endTime,
            teamMemberId: slot.team_member_id
          });
        }
      }
    });
    
    // Ordena por horário de início
    slots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    setAvailableSlots(slots);
    
    // Redefine o slot de tempo selecionado quando a data muda
    setSelectedTimeSlot(null);
  }, [selectedDate, timeSlots, appointments, teamMemberId, serviceId]); // Adiciona serviceId às dependências
  
  const handleTeamMemberChange = (value: string) => {
    setTeamMemberId(value);
    setServiceId(undefined); // Limpa a seleção de serviço quando o profissional muda
    setInsurancePlanId(undefined);
    setInsuranceLimitError(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCurrentStep(2); // Vai para a etapa de seleção de serviço
    
    // Atualiza os serviços disponíveis para este membro da equipe
    const memberServicesList = memberServices[value] || [];
    setAvailableServices(memberServicesList.length > 0 ? memberServicesList : services);
  };
  
  const handleServiceChange = (value: string) => {
    setServiceId(value);
    setInsurancePlanId(undefined); // Limpa a seleção de convênio quando o serviço muda
    setCurrentStep(3); // Vai para a etapa de seleção de convênio
  };
  
  const handleInsurancePlanChange = (value: string) => {
    setInsurancePlanId(value === "none" ? undefined : value);
    setInsuranceLimitError(null);
    setCurrentStep(4); // Avança para seleção de data
    
    if (value === "none") {
      return;
    }
    
    if (!teamMemberId) {
      setInsuranceLimitError("Você deve selecionar um profissional primeiro");
      return;
    }
    
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
    const plan = insurancePlans.find(p => p.id === value);
    if (plan && plan.limit_per_plan !== null && plan.current_appointments >= plan.limit_per_plan) {
      setInsuranceLimitError(`Este convênio atingiu o limite global de ${plan.limit_per_plan} agendamentos.`);
      return;
    }
  };
  
  const validateClientInfo = () => {
    if (!clientName || !clientEmail) {
      return false;
    }
    return true;
  };
  
  const handleDateSelect = (date: Date) => {
    // Garante que estamos trabalhando com uma cópia nova da data
    setSelectedDate(new Date(date));
    setSelectedTimeSlot(null);
    setCurrentStep(5); // Avança para seleção de horário
  };
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    setSelectedTimeSlot({ 
      date: new Date(date), 
      startTime, 
      endTime,
      teamMemberId 
    });
    setCurrentStep(6); // Avança para informações do cliente
  };
  
  const handleNextStep = () => {
    if (currentStep === 6) {
      if (validateClientInfo()) {
        handleSubmit();
      }
    }
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail || !serviceId) {
      return;
    }
    
    // Verifica limites do plano de seguro
    if (insuranceLimitError) {
      return;
    }
    
    onSubmit({
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      teamMemberId,
      insurancePlanId,
      serviceId // Adiciona serviceId ao envio
    });
  };
  
  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };
  
  return (
    <div className="max-h-[60vh] overflow-y-auto px-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Indicador de etapas */}
        <div className="flex justify-between mb-6 sticky top-0 bg-background z-10 py-2">
          <div className={`flex flex-col items-center ${getStepStatus(1) === "completed" ? "text-primary" : getStepStatus(1) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(1) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(1) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(1) === "completed" ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <span className="text-xs">Profissional</span>
          </div>
          <div className="flex-1 flex items-center mx-1">
            <div className={`h-0.5 w-full ${currentStep > 1 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${getStepStatus(2) === "completed" ? "text-primary" : getStepStatus(2) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(2) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(2) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(2) === "completed" ? <CheckCircle className="w-5 h-5" /> : "2"}
            </div>
            <span className="text-xs">Serviço</span>
          </div>
          <div className="flex-1 flex items-center mx-1">
            <div className={`h-0.5 w-full ${currentStep > 2 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${getStepStatus(3) === "completed" ? "text-primary" : getStepStatus(3) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(3) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(3) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(3) === "completed" ? <CheckCircle className="w-5 h-5" /> : "3"}
            </div>
            <span className="text-xs">Convênio</span>
          </div>
          <div className="flex-1 flex items-center mx-1">
            <div className={`h-0.5 w-full ${currentStep > 3 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${getStepStatus(4) === "completed" ? "text-primary" : getStepStatus(4) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(4) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(4) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(4) === "completed" ? <CheckCircle className="w-5 h-5" /> : "4"}
            </div>
            <span className="text-xs">Data</span>
          </div>
          <div className="flex-1 flex items-center mx-1">
            <div className={`h-0.5 w-full ${currentStep > 4 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${getStepStatus(5) === "completed" ? "text-primary" : getStepStatus(5) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(5) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(5) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(5) === "completed" ? <CheckCircle className="w-5 h-5" /> : "5"}
            </div>
            <span className="text-xs">Horário</span>
          </div>
          <div className="flex-1 flex items-center mx-1">
            <div className={`h-0.5 w-full ${currentStep > 5 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${getStepStatus(6) === "completed" ? "text-primary" : getStepStatus(6) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(6) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(6) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(6) === "completed" ? <CheckCircle className="w-5 h-5" /> : "6"}
            </div>
            <span className="text-xs">Cliente</span>
          </div>
        </div>

        {/* Etapa 1: Selecionar Profissional */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha um profissional</h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <Button
                    key={member.id} 
                    variant="outline"
                    className={`flex justify-between items-center p-4 h-auto ${teamMemberId === member.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => handleTeamMemberChange(member.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{member.name}</span>
                      {member.position && <span className="text-xs text-muted-foreground">{member.position}</span>}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                ))}
                
                {teamMembers.length === 0 && (
                  <div className="col-span-2 p-4 text-center border rounded-md">
                    <p className="text-muted-foreground">Nenhum profissional disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Etapa 2: Selecionar Serviço */}
        {currentStep === 2 && teamMemberId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha um serviço</h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-4">
                {availableServices.map(service => (
                  <Button
                    key={service.id}
                    variant="outline"
                    className={`flex justify-between items-center p-4 h-auto ${serviceId === service.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => handleServiceChange(service.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                ))}
                
                {availableServices.length === 0 && (
                  <div className="p-4 text-center border rounded-md">
                    <p className="text-muted-foreground">Este profissional não possui serviços disponíveis</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Etapa 3: Selecionar Plano de Seguro */}
        {currentStep === 3 && teamMemberId && serviceId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha um convênio</h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className={`flex justify-between items-center p-4 h-auto ${insurancePlanId === undefined ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => handleInsurancePlanChange("none")}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Particular</span>
                    <span className="text-xs text-muted-foreground">Pagamento direto</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                {availableInsurancePlans.map(plan => {
                  const isAvailable = plan.availableForBooking !== false;
                  const limitInfo = plan.memberLimit 
                    ? `${plan.memberCurrentAppointments}/${plan.memberLimit}`
                    : plan.limit_per_plan
                      ? `${plan.current_appointments}/${plan.limit_per_plan}`
                      : '';
                  
                  return (
                    <Button
                      key={plan.id} 
                      variant="outline"
                      disabled={!isAvailable}
                      className={`flex justify-between items-center p-4 h-auto ${insurancePlanId === plan.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => handleInsurancePlanChange(plan.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{plan.name}</span>
                        {limitInfo && (
                          <Badge 
                            variant={isAvailable ? "secondary" : "destructive"}
                            className="mt-1"
                          >
                            {limitInfo}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  );
                })}
                
                {availableInsurancePlans.length === 0 && teamMemberId && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Este profissional não tem convênios disponíveis
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Etapa 4: Selecionar Data */}
        {currentStep === 4 && teamMemberId && serviceId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha uma data</h2>
            
            <DateSelector 
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Etapa 5: Selecionar Horário */}
        {currentStep === 5 && selectedDate && teamMemberId && serviceId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha um horário</h2>
            
            <TimeSlotSelector 
              availableSlots={availableSlots}
              onSelectSlot={(date, start, end) => 
                handleTimeSlotSelect(date, start, end)
              }
              showConfirmButton={true}
            />
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Etapa 6: Informações do Cliente */}
        {currentStep === 6 && selectedTimeSlot && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Informações do cliente</h2>
            
            {selectedTimeSlot && (
              <div className="bg-accent/30 p-3 rounded-md mb-4">
                <p className="font-medium">
                  {teamMembers.find(m => m.id === teamMemberId)?.name || ''}
                </p>
                <p className="text-sm">
                  {format(selectedDate!, 'dd/MM/yyyy')} | {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
                <p className="text-sm mt-1">
                  <span className="text-muted-foreground">Serviço: </span>
                  <span className="font-medium">
                    {services.find(s => s.id === serviceId)?.name || ''}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Convênio: </span>
                  <span className="font-medium">
                    {insurancePlanId === undefined ? "Particular" : 
                     insurancePlans.find(p => p.id === insurancePlanId)?.name}
                  </span>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente <span className="text-destructive">*</span></Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="Nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email do Cliente <span className="text-destructive">*</span></Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone do Cliente</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Informações adicionais..."
              />
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>
                Voltar
              </Button>
              <Button 
                type="button" 
                onClick={handleNextStep}
                disabled={!clientName || !clientEmail}
              >
                {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Resumo das opções selecionadas */}
        {teamMemberId && currentStep < 6 && (
          <div className="mt-6 p-4 bg-accent/30 rounded-md">
            <h3 className="font-medium mb-2">Seleção atual:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profissional:</span>
                <span className="font-medium">
                  {teamMembers.find(m => m.id === teamMemberId)?.name || ''}
                  {teamMembers.find(m => m.id === teamMemberId)?.position ? 
                    ` - ${teamMembers.find(m => m.id === teamMemberId)?.position}` : ''}
                </span>
              </div>
              
              {serviceId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">
                    {services.find(s => s.id === serviceId)?.name || ''}
                  </span>
                </div>
              )}
              
              {insurancePlanId !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Convênio:</span>
                  <span className="font-medium">
                    {insurancePlanId === undefined ? "Particular" : 
                     insurancePlans.find(p => p.id === insurancePlanId)?.name || ''}
                  </span>
                </div>
              )}
              
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{format(selectedDate, 'dd/MM/yyyy')}</span>
                </div>
              )}
              
              {selectedTimeSlot && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AppointmentCreationForm;
