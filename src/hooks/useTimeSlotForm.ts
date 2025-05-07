
import { useState, useEffect } from 'react';
import { useAppointments } from '@/context/AppointmentContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TimeSlot } from '@/types';

interface UseTimeSlotFormProps {
  initialData?: TimeSlot;
  onSuccess?: () => void;
}

export const useTimeSlotForm = ({ initialData, onSuccess }: UseTimeSlotFormProps) => {
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
  
  // Form state
  const [startTime, setStartTime] = useState(initialData?.start_time || '');
  const [endTime, setEndTime] = useState(initialData?.end_time || '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [appointmentDuration, setAppointmentDuration] = useState(initialData?.appointment_duration_minutes?.toString() || '60');
  const [hasLunchBreak, setHasLunchBreak] = useState(!!initialData?.lunch_break_start && !!initialData?.lunch_break_end);
  const [lunchBreakStart, setLunchBreakStart] = useState(initialData?.lunch_break_start || '12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState(initialData?.lunch_break_end || '13:00');
  const [isLoading, setIsLoading] = useState(false);
  
  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>(initialData?.team_member_id || '');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Record<string, boolean>>({});
  
  // Batch mode toggle
  const [batchMode, setBatchMode] = useState(!isEditing);
  
  // If editing, preselect the day
  useEffect(() => {
    if (isEditing && initialData?.day_of_week !== undefined) {
      const day = initialData.day_of_week.toString();
      setSelectedDays(prev => ({ ...prev, [day]: true }));
    }
  }, [isEditing, initialData]);
  
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

  return {
    isEditing,
    dayOfWeek,
    setDayOfWeek,
    selectedDays,
    handleDayToggle,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    available,
    setAvailable,
    appointmentDuration,
    setAppointmentDuration,
    hasLunchBreak,
    setHasLunchBreak,
    lunchBreakStart,
    setLunchBreakStart,
    lunchBreakEnd,
    setLunchBreakEnd,
    isLoading,
    teamMembers,
    selectedTeamMember,
    setSelectedTeamMember,
    selectedTeamMembers,
    handleTeamMemberToggle,
    batchMode,
    setBatchMode,
    handleSubmit
  };
};
