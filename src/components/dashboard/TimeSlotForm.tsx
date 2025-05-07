
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeSlot, TeamMember } from '@/types';
import { useAppointments } from '@/context/AppointmentContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlotFormProps {
  onSuccess?: () => void;
  initialData?: TimeSlot;
}

const dayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

const durationOptions = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora e 30 minutos' },
  { value: '120', label: '2 horas' },
];

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onSuccess, initialData }) => {
  const isEditing = !!initialData;
  const { user } = useAuth();
  const { addTimeSlot, updateTimeSlot } = useAppointments();
  const { toast } = useToast();
  
  // Single day state (for editing)
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week.toString() || '');
  
  // Multiple days state (for batch creation)
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    '1': false, '2': false, '3': false, '4': false, '5': false, '0': false, '6': false
  });
  
  // If editing, preselect the day
  useEffect(() => {
    if (isEditing && initialData?.day_of_week !== undefined) {
      const day = initialData.day_of_week.toString();
      setSelectedDays(prev => ({ ...prev, [day]: true }));
    }
  }, [isEditing, initialData]);
  
  const [startTime, setStartTime] = useState(initialData?.start_time || '');
  const [endTime, setEndTime] = useState(initialData?.end_time || '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [appointmentDuration, setAppointmentDuration] = useState(initialData?.appointment_duration_minutes?.toString() || '60');
  const [hasLunchBreak, setHasLunchBreak] = useState(!!initialData?.lunch_break_start && !!initialData?.lunch_break_end);
  const [lunchBreakStart, setLunchBreakStart] = useState(initialData?.lunch_break_start || '12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState(initialData?.lunch_break_end || '13:00');
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Single team member state (for editing)
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>(initialData?.team_member_id || '');
  
  // Multiple team members state (for batch creation)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Record<string, boolean>>({});
  
  // Batch mode toggle
  const [batchMode, setBatchMode] = useState(!isEditing);
  
  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('professional_id', user.id)
            .eq('active', true);
            
          if (error) throw error;
          
          setTeamMembers(data || []);
          
          // Initialize selectedTeamMembers state
          const teamMembersState: Record<string, boolean> = {};
          data?.forEach(member => {
            teamMembersState[member.id] = false;
          });
          
          // If editing, preselect the team member
          if (isEditing && initialData?.team_member_id) {
            teamMembersState[initialData.team_member_id] = true;
          }
          
          setSelectedTeamMembers(teamMembersState);
        } catch (error) {
          console.error("Erro ao buscar membros da equipe:", error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os membros da equipe',
            variant: 'destructive',
          });
        }
      }
    };
    
    fetchTeamMembers();
  }, [user, toast, isEditing, initialData]);
  
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };
  
  const validateInputs = () => {
    if (!startTime || !endTime || !appointmentDuration) {
      toast({
        title: 'Erro',
        description: 'Preencha os horários e duração da consulta',
        variant: 'destructive',
      });
      return false;
    }
    
    // Validate that lunch break is within work hours if enabled
    if (hasLunchBreak) {
      if (!lunchBreakStart || !lunchBreakEnd) {
        toast({
          title: 'Erro',
          description: 'Horários de almoço inválidos',
          variant: 'destructive',
        });
        return false;
      }
      
      // Convert to minutes for easy comparison
      const getMinutes = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const startMinutes = getMinutes(startTime);
      const endMinutes = getMinutes(endTime);
      const lunchStartMinutes = getMinutes(lunchBreakStart);
      const lunchEndMinutes = getMinutes(lunchBreakEnd);
      
      if (lunchStartMinutes < startMinutes || lunchEndMinutes > endMinutes) {
        toast({
          title: 'Erro',
          description: 'O intervalo de almoço deve estar dentro do horário de trabalho',
          variant: 'destructive',
        });
        return false;
      }
      
      if (lunchStartMinutes >= lunchEndMinutes) {
        toast({
          title: 'Erro',
          description: 'O horário de início do almoço deve ser anterior ao horário de término',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para adicionar horários',
        variant: 'destructive',
      });
      return;
    }
    
    // Verify inputs
    if (!validateInputs()) {
      return;
    }
    
    // Check if at least one day is selected in batch mode
    if (batchMode) {
      const hasDays = Object.values(selectedDays).some(selected => selected);
      if (!hasDays) {
        toast({
          title: 'Erro',
          description: 'Selecione pelo menos um dia da semana',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if at least one team member is selected in batch mode
      const hasTeamMembers = Object.values(selectedTeamMembers).some(selected => selected);
      if (!hasTeamMembers) {
        toast({
          title: 'Erro',
          description: 'Selecione pelo menos um profissional',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Non-batch mode validations
      if (!dayOfWeek) {
        toast({
          title: 'Erro',
          description: 'Selecione um dia da semana',
          variant: 'destructive',
        });
        return;
      }
      
      if (!selectedTeamMember) {
        toast({
          title: 'Erro',
          description: 'Selecione um profissional',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const baseTimeSlotData = {
        professional_id: user.id,
        start_time: startTime,
        end_time: endTime,
        available,
        appointment_duration_minutes: parseInt(appointmentDuration),
        lunch_break_start: hasLunchBreak ? lunchBreakStart : null,
        lunch_break_end: hasLunchBreak ? lunchBreakEnd : null,
      };
      
      if (isEditing && initialData) {
        // Update existing time slot (no batch mode for editing)
        const success = await updateTimeSlot({
          ...baseTimeSlotData,
          id: initialData.id,
          day_of_week: parseInt(dayOfWeek),
          team_member_id: selectedTeamMember,
        });
        
        if (success) {
          toast({
            title: 'Sucesso',
            description: 'Horário atualizado com sucesso',
          });
          
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        // Create new time slots using batch mode
        const selectedTeamMemberIds = Object.entries(selectedTeamMembers)
          .filter(([_, selected]) => selected)
          .map(([id]) => id);
          
        const selectedDaysOfWeek = Object.entries(selectedDays)
          .filter(([_, selected]) => selected)
          .map(([day]) => parseInt(day));
          
        let successCount = 0;
        let failCount = 0;
        const totalToCreate = selectedDaysOfWeek.length * selectedTeamMemberIds.length;
          
        // Create time slots for each day and team member combination
        for (const day of selectedDaysOfWeek) {
          for (const teamMemberId of selectedTeamMemberIds) {
            const timeSlotData = {
              ...baseTimeSlotData,
              day_of_week: day,
              team_member_id: teamMemberId,
            };
            
            const success = await addTimeSlot(timeSlotData);
            
            if (success) {
              successCount++;
            } else {
              failCount++;
            }
          }
        }
        
        if (successCount > 0) {
          toast({
            title: 'Sucesso',
            description: `${successCount} de ${totalToCreate} horários foram adicionados com sucesso${
              failCount > 0 ? `. ${failCount} falharam.` : '.'
            }`,
          });
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Reset form if creating new slots
          setSelectedDays({
            '1': false, '2': false, '3': false, '4': false, '5': false, '0': false, '6': false
          });
          
          // Reset team member selections
          const resetTeamMembers: Record<string, boolean> = {};
          Object.keys(selectedTeamMembers).forEach(key => {
            resetTeamMembers[key] = false;
          });
          setSelectedTeamMembers(resetTeamMembers);
          
          setStartTime('');
          setEndTime('');
          setAvailable(true);
          setAppointmentDuration('60');
          setHasLunchBreak(false);
          setLunchBreakStart('12:00');
          setLunchBreakEnd('13:00');
        } else {
          toast({
            title: 'Erro',
            description: 'Não foi possível adicionar os horários',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua solicitação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-h-full">
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
        {!isEditing && (
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Switch
              id="batchMode"
              checked={batchMode}
              onCheckedChange={setBatchMode}
            />
            <Label htmlFor="batchMode">Adicionar múltiplos horários</Label>
          </div>
        )}

        {/* Team Member Selection */}
        {teamMembers.length > 0 && (
          <div className="space-y-2">
            <Label>
              Profissionais <span className="text-destructive">*</span>
            </Label>
            
            {batchMode ? (
              <div className="space-y-2">
                <div className="h-[150px] overflow-y-auto border rounded-md p-4">
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`member-${member.id}`}
                          checked={selectedTeamMembers[member.id] || false}
                          onCheckedChange={() => handleTeamMemberToggle(member.id)}
                        />
                        <Label 
                          htmlFor={`member-${member.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {member.name} {member.position ? `- ${member.position}` : ''}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione os profissionais que irão atender nestes horários.
                </p>
              </div>
            ) : (
              <Select
                value={selectedTeamMember}
                onValueChange={setSelectedTeamMember}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.position ? `- ${member.position}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Day Selection */}
        <div className="space-y-2">
          <Label>
            Dia(s) da semana <span className="text-destructive">*</span>
          </Label>
          
          {batchMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {dayOptions.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day.value}`}
                    checked={selectedDays[day.value] || false}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label 
                    htmlFor={`day-${day.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <Select
              value={dayOfWeek}
              onValueChange={setDayOfWeek}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">
              Horário inicial <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">
              Horário final <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appointmentDuration">Duração da consulta</Label>
          <Select
            value={appointmentDuration}
            onValueChange={setAppointmentDuration}
          >
            <SelectTrigger>
              <SelectValue placeholder="Duração" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              id="hasLunchBreak"
              checked={hasLunchBreak}
              onCheckedChange={setHasLunchBreak}
            />
            <Label htmlFor="hasLunchBreak">Incluir intervalo de almoço</Label>
          </div>
          
          {hasLunchBreak && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="lunchBreakStart">Início do almoço</Label>
                <Input
                  id="lunchBreakStart"
                  type="time"
                  value={lunchBreakStart}
                  onChange={(e) => setLunchBreakStart(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lunchBreakEnd">Fim do almoço</Label>
                <Input
                  id="lunchBreakEnd"
                  type="time"
                  value={lunchBreakEnd}
                  onChange={(e) => setLunchBreakEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="available"
            checked={available}
            onCheckedChange={setAvailable}
          />
          <Label htmlFor="available">Disponível para agendamento</Label>
        </div>
      </div>
      
      <div className="p-4 border-t mt-4 bg-background sticky bottom-0">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : isEditing 
            ? 'Salvar alterações' 
            : batchMode 
              ? 'Adicionar horários em lote' 
              : 'Adicionar horário'}
        </Button>
      </div>
    </form>
  );
};

export default TimeSlotForm;
