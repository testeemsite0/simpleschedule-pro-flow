
import React from 'react';
import TimeSlotSelector from '../TimeSlotSelector';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface TimeStepProps {
  availableSlots: AvailableSlot[];
  selectedDate?: Date | null;
  selectedStartTime?: string;
  selectedEndTime?: string;
  availableDates?: Date[];
  onTimeSlotSelect: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
  onDateChange?: (date: Date) => void;
  onTimeChange?: (startTime: string, endTime: string) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export const TimeStep: React.FC<TimeStepProps> = ({
  availableSlots,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  availableDates,
  onTimeSlotSelect,
  onDateChange,
  onTimeChange,
  isLoading,
  onBack
}) => {
  // Debug available slots
  console.log("TimeStep rendered with", availableSlots.length, "available slots");
  
  const handleSelectSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    console.log("TimeStep: Slot selected", { date, startTime, endTime, teamMemberId });
    
    // Use the appropriate handler based on what was provided
    if (onTimeChange && onDateChange) {
      onDateChange(date);
      onTimeChange(startTime, endTime);
    } else {
      onTimeSlotSelect(date, startTime, endTime, teamMemberId);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um horário
      </h2>
      <TimeSlotSelector 
        availableSlots={availableSlots}
        onSelectSlot={handleSelectSlot}
        showConfirmButton={false}
      />
    </div>
  );
};
