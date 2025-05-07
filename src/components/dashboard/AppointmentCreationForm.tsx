import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlot, Appointment, TeamMember, InsurancePlan, TeamMemberInsurancePlan } from '@/types';
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
  const [insurancePlanId, setInsurancePlanId] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [teamMemberInsurancePlans, setTeamMemberInsurancePlans] = useState<TeamMemberInsurancePlan[]>([]);
  const [insuranceLimitError, setInsuranceLimitError] = useState<string | null>(null);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState<InsurancePlan[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Fetch team members and insurance plans
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
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
          .eq('professional_id', professionalId);
          
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
          .eq('professional_id', professionalId)
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
  }, [professionalId]);
  
  // Generate available dates for selection based on time slots
  useEffect(() => {
    if (!teamMemberId) {
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Filter time slots by selected team member
    const memberTimeSlots = timeSlots.filter(
      slot => slot.team_member_id === teamMemberId && slot.available
    );
    
    // Find all unique dates in the next 14 days that have available slots
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // Skip dates before today
      if (date < now) continue;
      
      const dayOfWeek = date.getDay();
      
      // Check if there are available slots for this day of week
      const hasAvailableSlots = memberTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek
      );
      
      if (hasAvailableSlots) {
        dates.push(new Date(date));
      }
    }
    
    setAvailableDates(dates);
    
    // Automatically select the first date if available
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(new Date(dates[0]));
    }
  }, [timeSlots, teamMemberId, selectedDate]);
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate || !teamMemberId) {
      setAvailableSlots([]);
      return;
    }
    
    // Create a fresh copy of the date to avoid reference issues
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Get all time slots for this day for the selected team member
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      slot.available &&
      slot.team_member_id === teamMemberId
    );
    
    // Format selected date for database comparison
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Get all booked slots for this date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && 
      app.status === 'scheduled' &&
      app.team_member_id === teamMemberId
    );
    
    // Convert these into appointment slots
    const slots: AvailableSlot[] = [];
    const now = new Date();
    
    daySlotsData.forEach(slot => {
      // Convert times to minutes for easier calculation
      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Handle lunch break if present
      const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
      
      // Generate slots
      for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
        // Skip slots that overlap with lunch break
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
        
        // Check if slot is already booked
        const isOverlapping = bookedAppointments.some(app => {
          return doTimeSlotsOverlap(
            startTime, 
            endTime, 
            app.start_time, 
            app.end_time
          );
        });
        
        // Only add if not booked
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
    
    // Sort by start time
    slots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    setAvailableSlots(slots);
    
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
  }, [selectedDate, timeSlots, appointments, teamMemberId]);
  
  const handleTeamMemberChange = (value: string) => {
    setTeamMemberId(value);
    setInsurancePlanId(undefined); // Limpa a seleção de convênio quando o profissional muda
    setInsuranceLimitError(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCurrentStep(2); // Vai para a etapa de seleção de convênio
    
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
    setCurrentStep(3); // Avança para seleção de data
    
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
    // Ensure we're working with a fresh copy of the date
    setSelectedDate(new Date(date));
    setSelectedTimeSlot(null);
    setCurrentStep(4); // Avança para seleção de horário
  };
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    setSelectedTimeSlot({ 
      date: new Date(date), 
      startTime, 
      endTime,
      teamMemberId 
    });
    setCurrentStep(5); // Avança para informações do cliente
  };
  
  const handleNextStep = () => {
    if (currentStep === 5) {
      if (validateClientInfo()) {
        handleSubmit();
      }
    }
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
      return;
    }
    
    // Check insurance plan limits
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
      insurancePlanId
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
        {/* Steps indicator */}
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
            <span className="text-xs">Convênio</span>
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
            <span className="text-xs">Data</span>
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
            <span className="text-xs">Horário</span>
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
            <span className="text-xs">Cliente</span>
          </div>
        </div>

        {/* Step 1: Select Professional */}
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
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Select Insurance Plan */}
        {currentStep === 2 && teamMemberId && (
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
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Select Date */}
        {currentStep === 3 && teamMemberId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Escolha uma data</h2>
            
            <DateSelector 
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Select Time */}
        {currentStep === 4 && selectedDate && teamMemberId && (
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
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 5: Client Information */}
        {currentStep === 5 && selectedTimeSlot && (
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
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
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
        
        {/* Selected options summary */}
        {teamMemberId && currentStep < 5 && (
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
