
import React from 'react';
import { TimeStep } from '../steps/TimeStep';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface TimeStepContentProps {
  availableSlots: TimeSlot[];
  selectedDate: Date | null;
  selectedStartTime: string | undefined;
  selectedEndTime: string | undefined;
  onTimeSlotSelect: (date: Date, startTime: string, endTime: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const TimeStepContent: React.FC<TimeStepContentProps> = ({
  availableSlots,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onTimeSlotSelect,
  isLoading,
  onBack
}) => {
  // Filter slots for the selected date
  const filteredSlots = selectedDate 
    ? availableSlots.filter(slot => 
        slot.date.toDateString() === selectedDate.toDateString()
      )
    : availableSlots;

  // Log for debugging
  console.log("TimeStepContent: Rendering with", {
    totalSlots: availableSlots.length,
    filteredSlots: filteredSlots.length,
    selectedDate: selectedDate ? selectedDate.toDateString() : "none",
    selectedTimeRange: selectedStartTime && selectedEndTime ? `${selectedStartTime}-${selectedEndTime}` : "none"
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <h2 className="text-xl font-semibold">Escolha um horário</h2>
        <p className="text-muted-foreground">Carregando horários disponíveis...</p>
      </div>
    );
  }

  // No slots available for the selected date
  if (selectedDate && filteredSlots.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Escolha um horário</h2>
        
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Não há horários disponíveis para a data selecionada ({selectedDate.toLocaleDateString()}). 
            Por favor, tente selecionar outra data.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={onBack}
          >
            Voltar para seleção de data
          </button>
        </div>
      </div>
    );
  }

  return (
    <TimeStep
      availableSlots={filteredSlots}
      selectedDate={selectedDate}
      selectedStartTime={selectedStartTime}
      selectedEndTime={selectedEndTime}
      onTimeSlotSelect={onTimeSlotSelect}
      isLoading={isLoading}
      onBack={onBack}
    />
  );
};
