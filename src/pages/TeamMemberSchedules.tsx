
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotsList from '@/components/dashboard/timeslots/TimeSlotsList';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import TimeSlotDialog from '@/components/dashboard/timeslots/TimeSlotDialog';

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
    handleBatchDelete
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
  
  if (!user) {
    return null;
  }
  
  const handleGoBack = () => {
    navigate("/dashboard/schedules");
  };
  
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error || 'Membro da equipe não encontrado'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Horários
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title={`Horários de ${teamMember.name}`}>
      <div className="space-y-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Configure os horários em que {teamMember.name} está disponível para atendimentos.
          </p>
          
          <TimeSlotDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            selectedTimeSlot={selectedTimeSlot ? {...selectedTimeSlot, team_member_id: teamMember.id} : undefined}
            onSuccess={handleAddSuccess}
            buttonText="Adicionar horário"
          />
        </div>
        
        {timeSlotsLoading ? (
          <p>Carregando horários...</p>
        ) : (
          <TimeSlotsList 
            timeSlots={timeSlots}
            teamMembers={[teamMember]}
            onEdit={handleEditTimeSlot}
            onDelete={handleDeleteTimeSlot}
            onBatchDelete={handleBatchDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamMemberSchedules;
