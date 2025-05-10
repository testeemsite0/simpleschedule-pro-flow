
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotsList from '@/components/dashboard/timeslots/TimeSlotsList';
import TeamSchedulesManager from '@/components/dashboard/TeamSchedulesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeSlotDialog from '@/components/dashboard/timeslots/TimeSlotDialog';
import { useTimeSlots } from '@/hooks/useTimeSlots';

const DashboardSchedules = () => {
  const [activeTab, setActiveTab] = useState("general");
  const {
    timeSlots,
    teamMembers,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    selectedTimeSlot,
    setSelectedTimeSlot,
    handleAddSuccess,
    handleEditTimeSlot,
    handleDeleteTimeSlot,
    handleBatchDelete
  } = useTimeSlots();
  
  return (
    <DashboardLayout title="Horários">
      <div className="space-y-8">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">Horários Gerais</TabsTrigger>
            <TabsTrigger value="team">Por Membro da Equipe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Configure seus horários de trabalho e disponibilidade para agendamentos.
              </p>
              
              <TimeSlotDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedTimeSlot={selectedTimeSlot}
                onSuccess={handleAddSuccess}
                buttonText="Adicionar horário"
              />
            </div>
            
            {isLoading ? (
              <p>Carregando horários...</p>
            ) : (
              <TimeSlotsList 
                timeSlots={timeSlots}
                teamMembers={teamMembers}
                onEdit={handleEditTimeSlot}
                onDelete={handleDeleteTimeSlot}
                onBatchDelete={handleBatchDelete}
              />
            )}
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6 pt-4">
            <TeamSchedulesManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSchedules;
