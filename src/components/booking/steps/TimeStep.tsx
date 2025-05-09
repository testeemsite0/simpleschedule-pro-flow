
import React from 'react';
import { Button } from '@/components/ui/button';
import TimeSlotSelector from '../TimeSlotSelector';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface TimeStepProps {
  availableSlots: AvailableSlot[];
  onTimeSlotSelect: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
  onBack: () => void;
}

export const TimeStep: React.FC<TimeStepProps> = ({
  availableSlots,
  onTimeSlotSelect,
  onBack
}) => {
  // Debug available slots
  console.log("TimeStep rendered with", availableSlots.length, "available slots");
  
  const handleSelectSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    console.log("TimeStep: Slot selected", { date, startTime, endTime, teamMemberId });
    onTimeSlotSelect(date, startTime, endTime, teamMemberId);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um horário
      </h2>
      <TimeSlotSelector 
        availableSlots={availableSlots}
        onSelectSlot={handleSelectSlot}
        showConfirmButton={false}  // Changed to false to make selection immediate
      />
      
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
