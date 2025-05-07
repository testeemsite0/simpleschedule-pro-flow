
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TimeSlotForm from './TimeSlotForm';
import { TimeSlot } from '@/types';

interface TimeSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTimeSlot?: TimeSlot;
  onSuccess: () => void;
  buttonText?: string;
}

const TimeSlotDialog: React.FC<TimeSlotDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedTimeSlot,
  onSuccess,
  buttonText = 'Adicionar horário'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedTimeSlot ? 'Editar horário' : 'Adicionar novo horário'}
          </DialogTitle>
        </DialogHeader>
        <TimeSlotForm 
          onSuccess={onSuccess}
          initialData={selectedTimeSlot}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotDialog;
