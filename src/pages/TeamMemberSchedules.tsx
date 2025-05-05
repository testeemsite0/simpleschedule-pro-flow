
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotForm from '@/components/dashboard/TimeSlotForm';
import TimeSlotsList from '@/components/dashboard/TimeSlotsList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { TimeSlot, TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const TeamMemberSchedules = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();
  const { getTimeSlotsByTeamMember } = useAppointments();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
          fetchTimeSlots(data.id);
        } else {
          setError('Membro da equipe não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch team member:", error);
        setError('Erro ao buscar dados do membro da equipe');
        setLoading(false);
      }
    };
    
    const fetchTimeSlots = async (teamMemberId: string) => {
      try {
        const data = await getTimeSlotsByTeamMember(teamMemberId);
        setTimeSlots(data);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        setError('Erro ao buscar horários');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMember();
  }, [user, memberId, getTimeSlotsByTeamMember]);
  
  if (!user) {
    return null;
  }
  
  const handleAddSuccess = () => {
    // Refresh time slots
    if (teamMember) {
      getTimeSlotsByTeamMember(teamMember.id).then(data => {
        setTimeSlots(data);
      });
    }
    setIsDialogOpen(false);
  };
  
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
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
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title={`Horários de ${teamMember.name}`}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Configure os horários em que {teamMember.name} está disponível para atendimentos.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTimeSlot(undefined)}>
                Adicionar horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedTimeSlot ? 'Editar horário' : 'Adicionar novo horário'}
                </DialogTitle>
              </DialogHeader>
              <TimeSlotForm 
                onSuccess={handleAddSuccess}
                initialData={selectedTimeSlot ? {...selectedTimeSlot, team_member_id: teamMember.id} : undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <p>Carregando horários...</p>
        ) : (
          <TimeSlotsList 
            timeSlots={timeSlots}
            onEdit={handleEditTimeSlot}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamMemberSchedules;
