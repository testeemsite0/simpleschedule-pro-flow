
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import TeamMemberHeader from '@/components/dashboard/team/TeamMemberHeader';
import TeamMemberScheduleContent from '@/components/dashboard/team/TeamMemberScheduleContent';
import TeamMemberErrorState from '@/components/dashboard/team/TeamMemberErrorState';

const TeamMemberSchedules = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    timeSlots,
    isLoading: timeSlotsLoading,
    isDialogOpen,
    setIsDialogOpen,
    selectedTimeSlot,
    setSelectedTimeSlot,
    handleAddSuccess,
    handleEditTimeSlot,
    handleDeleteTimeSlot,
    handleBatchDelete,
    teamMembers
  } = useTimeSlots(memberId);
  
  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!memberId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', memberId)
          .eq('professional_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setTeamMember(data);
        } else {
          setError('Membro da equipe não encontrado');
        }
      } catch (error) {
        console.error("Failed to fetch team member:", error);
        setError('Erro ao buscar dados do membro da equipe');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMember();
  }, [user, memberId]);
  
  const handleGoBack = () => {
    navigate("/dashboard/schedules");
  };
  
  if (!user) {
    return null;
  }
  
  if (loading) {
    return (
      <DashboardLayout title="Carregando...">
        <div>Carregando dados...</div>
      </DashboardLayout>
    );
  }
  
  if (error || !teamMember) {
    return (
      <DashboardLayout title="Erro">
        <TeamMemberErrorState error={error || ''} onGoBack={handleGoBack} />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title={`Horários de ${teamMember.name}`}>
      <div className="space-y-8">
        <TeamMemberHeader 
          teamMember={teamMember}
          onGoBack={handleGoBack}
        />
        
        <TeamMemberScheduleContent
          teamMember={teamMember}
          timeSlots={timeSlots}
          teamMembers={teamMembers.length > 0 ? teamMembers : [teamMember]}
          isLoading={timeSlotsLoading}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          selectedTimeSlot={selectedTimeSlot}
          handleAddSuccess={handleAddSuccess}
          handleEditTimeSlot={handleEditTimeSlot}
          handleDeleteTimeSlot={handleDeleteTimeSlot}
          handleBatchDelete={handleBatchDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default TeamMemberSchedules;
