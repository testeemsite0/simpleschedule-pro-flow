
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TimeSlotForm from '@/components/dashboard/TimeSlotForm';
import TimeSlotsList from '@/components/dashboard/TimeSlotsList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { TimeSlot } from '@/types';

const DashboardSchedules = () => {
  const { user } = useAuth();
  const { getTimeSlotsByProfessional } = useAppointments();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  
  if (!user) {
    return null;
  }
  
  const timeSlots = getTimeSlotsByProfessional(user.id);
  
  const handleAddSuccess = () => {
    setIsDialogOpen(false);
  };
  
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
  };
  
  return (
    <DashboardLayout title="Gerenciar horários disponíveis">
      <div className="space-y-8">
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
        
        <TimeSlotsList 
          timeSlots={timeSlots}
          onEdit={handleEditTimeSlot}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardSchedules;
