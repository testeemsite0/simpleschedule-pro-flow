
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotForm from '@/components/dashboard/TimeSlotForm';
import TimeSlotsList from '@/components/dashboard/TimeSlotsList';
import TeamSchedulesManager from '@/components/dashboard/TeamSchedulesManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { TimeSlot } from '@/types';

const DashboardSchedules = () => {
  const { user } = useAuth();
  const { getTimeSlotsByProfessional } = useAppointments();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (user) {
        try {
          const data = await getTimeSlotsByProfessional(user.id);
          setTimeSlots(data);
        } catch (error) {
          console.error("Failed to fetch time slots:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTimeSlots();
  }, [user, getTimeSlotsByProfessional]);
  
  if (!user) {
    return null;
  }
  
  const handleAddSuccess = () => {
    // Refresh time slots
    getTimeSlotsByProfessional(user.id).then(data => {
      setTimeSlots(data);
    });
    setIsDialogOpen(false);
  };
  
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
  };
  
  return (
    <DashboardLayout title="Gerenciar horários disponíveis">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">Horários Gerais</TabsTrigger>
          <TabsTrigger value="team">Horários por Membro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Configure os horários em que você está disponível para atendimentos.
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
          
          {loading ? (
            <p>Carregando horários...</p>
          ) : (
            <TimeSlotsList 
              timeSlots={timeSlots}
              onEdit={handleEditTimeSlot}
            />
          )}
        </TabsContent>
        
        <TabsContent value="team">
          <TeamSchedulesManager />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DashboardSchedules;
