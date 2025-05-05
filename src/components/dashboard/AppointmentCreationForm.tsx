
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlot, Appointment, TeamMember, InsurancePlan } from '@/types';
import { format } from 'date-fns';
import { timeToMinutes, minutesToTime, doTimeSlotsOverlap } from '../booking/timeUtils';
import DateSelector from '../booking/DateSelector';
import TimeSlotSelector from '../booking/TimeSlotSelector';
import { supabase } from '@/integrations/supabase/client';

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
    
    fetchTeamMembers();
    fetchInsurancePlans();
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
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
          
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">Profissional</Label>
              <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                <SelectTrigger id="teamMember">
                  <SelectValue placeholder="Selecione um profissional (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem profissional específico</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.position ? `- ${member.position}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {insurancePlans.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="insurancePlan">Convênio</Label>
              <Select value={insurancePlanId} onValueChange={setInsurancePlanId}>
                <SelectTrigger id="insurancePlan">
                  <SelectValue placeholder="Particular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Particular</SelectItem>
                  {insurancePlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <Button type="submit" disabled={isSubmitting || !selectedTimeSlot}>
          {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentCreationForm;
