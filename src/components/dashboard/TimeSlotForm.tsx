
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week.toString() || '');
  const [startTime, setStartTime] = useState(initialData?.start_time || '');
  const [endTime, setEndTime] = useState(initialData?.end_time || '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [appointmentDuration, setAppointmentDuration] = useState(initialData?.appointment_duration_minutes?.toString() || '60');
  const [hasLunchBreak, setHasLunchBreak] = useState(!!initialData?.lunch_break_start && !!initialData?.lunch_break_end);
  const [lunchBreakStart, setLunchBreakStart] = useState(initialData?.lunch_break_start || '12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState(initialData?.lunch_break_end || '13:00');
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>(initialData?.team_member_id || '');
  
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
  }, [user, toast]);
  
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
    
    if (!dayOfWeek || !startTime || !endTime || !appointmentDuration || !selectedTeamMember) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios, incluindo o profissional',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate that lunch break is within work hours
    if (hasLunchBreak) {
      if (!lunchBreakStart || !lunchBreakEnd) {
        toast({
          title: 'Erro',
          description: 'Horários de almoço inválidos',
          variant: 'destructive',
        });
        return;
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
        return;
      }
      
      if (lunchStartMinutes >= lunchEndMinutes) {
        toast({
          title: 'Erro',
          description: 'O horário de início do almoço deve ser anterior ao horário de término',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const timeSlotData = {
        professional_id: user.id,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        available,
        appointment_duration_minutes: parseInt(appointmentDuration),
        lunch_break_start: hasLunchBreak ? lunchBreakStart : null,
        lunch_break_end: hasLunchBreak ? lunchBreakEnd : null,
        team_member_id: selectedTeamMember,
      };
      
      let success;
      
      if (isEditing && initialData) {
        success = await updateTimeSlot({
          ...timeSlotData,
          id: initialData.id,
        });
      } else {
        success = await addTimeSlot(timeSlotData);
      }
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: isEditing 
            ? 'Horário atualizado com sucesso' 
            : 'Horário adicionado com sucesso',
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (!isEditing) {
          setDayOfWeek('');
          setStartTime('');
          setEndTime('');
          setAvailable(true);
          setAppointmentDuration('60');
          setHasLunchBreak(false);
          setLunchBreakStart('12:00');
          setLunchBreakEnd('13:00');
          setSelectedTeamMember('');
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
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Horário' : 'Adicionar Novo Horário'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">
                Profissional <span className="text-destructive">*</span>
              </Label>
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
              <p className="text-xs text-muted-foreground">
                Selecione o profissional que irá atender neste horário.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Dia da semana</Label>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário inicial</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário final</Label>
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
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar horário'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeSlotForm;
