
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot, TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useTimeSlots = (teamMemberId?: string) => {
  const { user } = useAuth();
  const { getTimeSlotsByProfessional, getTimeSlotsByTeamMember, deleteTimeSlot } = useAppointments();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', user.id)
          .eq('active', true);
          
        if (teamError) throw teamError;
        setTeamMembers(teamData || []);
        
        // Fetch time slots
        let data: TimeSlot[];
        if (teamMemberId) {
          data = await getTimeSlotsByTeamMember(teamMemberId);
        } else {
          data = await getTimeSlotsByProfessional(user.id);
        }
        
        setTimeSlots(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError('Não foi possível carregar os dados');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os horários',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, teamMemberId, getTimeSlotsByProfessional, getTimeSlotsByTeamMember, toast]);
  
  const handleAddSuccess = async () => {
    // Refresh time slots
    try {
      setIsLoading(true);
      if (user) {
        let data: TimeSlot[];
        if (teamMemberId) {
          data = await getTimeSlotsByTeamMember(teamMemberId);
        } else {
          data = await getTimeSlotsByProfessional(user.id);
        }
        setTimeSlots(data);
      }
    } catch (error) {
      console.error("Error refreshing time slots:", error);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
  };
  
  const handleDeleteTimeSlot = async (timeSlot: TimeSlot) => {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        const success = await deleteTimeSlot(timeSlot.id);
        
        if (success) {
          toast({
            title: 'Sucesso',
            description: 'Horário excluído com sucesso',
          });
          
          // Refresh time slots
          handleAddSuccess();
        } else {
          throw new Error('Falha ao excluir horário');
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o horário',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleBatchDelete = async (timeSlotIds: string[]) => {
    if (timeSlotIds.length === 0) return;
    
    // Ask for confirmation
    if (confirm(`Tem certeza que deseja excluir ${timeSlotIds.length} horário(s)?`)) {
      try {
        let success = true;
        let failedCount = 0;
        
        // Delete each time slot
        for (const id of timeSlotIds) {
          const result = await deleteTimeSlot(id);
          if (!result) {
            success = false;
            failedCount++;
          }
        }
        
        // Show appropriate toast message
        if (success) {
          toast({
            title: 'Sucesso',
            description: `${timeSlotIds.length} horário(s) excluído(s) com sucesso`,
          });
        } else {
          toast({
            title: 'Atenção',
            description: `${timeSlotIds.length - failedCount} horário(s) excluído(s), mas ${failedCount} falhou(aram)`,
            variant: 'default',
          });
        }
        
        // Refresh time slots
        handleAddSuccess();
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao excluir os horários',
          variant: 'destructive',
        });
      }
    }
  };
  
  return {
    timeSlots,
    teamMembers,
    isLoading,
    error,
    isDialogOpen,
    setIsDialogOpen,
    selectedTimeSlot,
    setSelectedTimeSlot,
    handleAddSuccess,
    handleEditTimeSlot,
    handleDeleteTimeSlot,
    handleBatchDelete
  };
};
