
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import TimeSlotsList from '@/components/dashboard/timeslots/TimeSlotsList';
import TeamSchedulesManager from '@/components/dashboard/TeamSchedulesManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeSlotDialog from '@/components/dashboard/timeslots/TimeSlotDialog';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useToast } from '@/hooks/use-toast';

const DashboardSchedules = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const { toast } = useToast();
  
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
  
  // Enhanced batch success handler with loading state and feedback
  const handleAddWithFeedback = async (data: any) => {
    // Check if it's a batch operation
    if (data.batchMode) {
      setIsBatchProcessing(true);
      toast({
        title: 'Processando',
        description: 'Gerando horários em lote. Por favor, aguarde...',
      });
      
      try {
        await handleAddSuccess(data);
        toast({
          title: 'Sucesso',
          description: `${data.batchCount || 'Múltiplos'} horários foram gerados com sucesso.`,
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Houve um problema ao gerar os horários.',
          variant: 'destructive'
        });
      } finally {
        setIsBatchProcessing(false);
      }
    } else {
      // Regular non-batch add
      handleAddSuccess(data);
    }
  };
  
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
                onSuccess={handleAddWithFeedback}
                buttonText="Adicionar horário"
                isBatchProcessing={isBatchProcessing}
              />
            </div>
            
            {isLoading || isBatchProcessing ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>{isLoading ? 'Carregando horários...' : 'Processando criação em lote...'}</p>
              </div>
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
