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
import { AlertCircle } from 'lucide-react';

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
  const [eligibleTeamMembers, setEligibleTeamMembers] = useState<string[]>([]);
  
  // Buscar membros da equipe e convênios
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
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Check if there are available slots for this day of week
      const hasAvailableSlots = timeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      if (hasAvailableSlots) {
        dates.push(new Date(date));
      }
    }
    
    setAvailableDates(dates);
    
    // Automatically select the first date if available
    if (dates.length > 0) {
      setSelectedDate(new Date(dates[0]));
    }
  }, [timeSlots]);
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    
    // Create a fresh copy of the date to avoid reference issues
    const date = new Date(selectedDate);
    // Use getDay() to get day of week (0-6)
    const dayOfWeek = date.getDay();
    console.log("Selected day of week for manual booking:", dayOfWeek);
    
    // Get all time slots for this day
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.available
    );
    
    console.log("Available time slots for day:", daySlotsData);
    
    // Format selected date for database comparison
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Get all booked slots for this date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    console.log("Booked appointments:", bookedAppointments);
    
    // Convert these into appointment slots
    const slots: AvailableSlot[] = [];
    
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
            date: new Date(selectedDate),
            startTime: startTime,
            endTime: endTime,
            teamMemberId: slot.team_member_id
          });
        }
      }
    });
    
    // Sort by start time
    slots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    console.log("Available slots for manual booking:", slots);
    setAvailableSlots(slots);
    
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
  }, [selectedDate, timeSlots, appointments]);
  
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
          setInsuranceLimitError(`O profissional selecionado não atende este convênio. Por favor, escolha outro convênio ou profissional.`);
          return;
        }
        
        // Check member-specific limit
        if (memberPlan.limit_per_member !== null && memberPlan.current_appointments >= memberPlan.limit_per_member) {
          setInsuranceLimitError(`O profissional selecionado atingiu o limite de atendimentos para este convênio. Por favor, escolha outro profissional.`);
        }
      }
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
      return;
    }
    
    // Check insurance plan limits
    if (insuranceLimitError) {
      return;
    }
    
    // If insurance plan selected but no team member, prevent submission
    if (insurancePlanId && insurancePlanId !== "none" && (!teamMemberId || teamMemberId === "none")) {
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
  
  const handleDateSelect = (date: Date) => {
    // Ensure we're working with a fresh copy of the date
    setSelectedDate(new Date(date));
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string, teamMemberIdFromSlot?: string) => {
    setSelectedTimeSlot({ 
      date: new Date(date), 
      startTime, 
      endTime,
      teamMemberId: teamMemberIdFromSlot 
    });
    
    // Se o horário estiver associado a um membro da equipe, pré-selecione-o
    if (teamMemberIdFromSlot) {
      setTeamMemberId(teamMemberIdFromSlot);
    } else {
      setTeamMemberId(undefined);
    }
  };
  
  const availableInsurancePlans = getAvailableInsurancePlans();
  const eligibleMembers = getEligibleTeamMembers();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DateSelector
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
      />
      
      <TimeSlotSelector
        availableSlots={availableSlots}
        onSelectSlot={(date, start, end, teamMemberId) => 
          handleTimeSlotSelect(date, start, end, teamMemberId)
        }
      />
      
      {selectedTimeSlot && (
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email do Cliente</Label>
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
                Profissional
                {insurancePlanId && insurancePlanId !== "none" ? " *" : ""}
              </Label>
              <Select value={teamMemberId} onValueChange={handleTeamMemberChange}>
                <SelectTrigger id="teamMember">
                  <SelectValue placeholder={
                    insurancePlanId && insurancePlanId !== "none" 
                      ? "Selecione um profissional (obrigatório)" 
                      : "Selecione um profissional (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!insurancePlanId || insurancePlanId === "none" ? (
                    <SelectItem value="none">Sem profissional específico</SelectItem>
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
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais..."
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={
            isSubmitting || 
            !selectedTimeSlot || 
            !!insuranceLimitError || 
            (insurancePlanId && insurancePlanId !== "none" && (!teamMemberId || teamMemberId === "none"))
          }
        >
          {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentCreationForm;
