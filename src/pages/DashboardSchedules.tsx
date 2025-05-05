
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotForm from '@/components/dashboard/TimeSlotForm';
import TimeSlotsList from '@/components/dashboard/TimeSlotsList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot, TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const DashboardSchedules = () => {
  const { user } = useAuth();
  const { getTimeSlotsByProfessional, deleteTimeSlot } = useAppointments();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!user) return;
      
      try {
        const data = await getTimeSlotsByProfessional(user.id);
        setTimeSlots(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os horários',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    const fetchTeamMembers = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', user.id)
          .eq('active', true);
          
        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };
    
    fetchTimeSlots();
    fetchTeamMembers();
  }, [user, getTimeSlotsByProfessional, toast]);
  
  const handleAddSuccess = () => {
    // Refresh time slots
    if (user) {
      getTimeSlotsByProfessional(user.id).then(data => {
        setTimeSlots(data);
      });
    }
    setIsDialogOpen(false);
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
          if (user) {
            const data = await getTimeSlotsByProfessional(user.id);
            setTimeSlots(data);
          }
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
  
  return (
    <DashboardLayout title="Horários">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Configure seus horários de trabalho e disponibilidade para agendamentos.
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
                initialData={selectedTimeSlot}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <p>Carregando horários...</p>
        ) : (
          <TimeSlotsList 
            timeSlots={timeSlots}
            teamMembers={teamMembers}
            onEdit={handleEditTimeSlot}
            onDelete={handleDeleteTimeSlot}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSchedules;
