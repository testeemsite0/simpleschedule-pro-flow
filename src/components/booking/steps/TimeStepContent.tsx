
import React from 'react';
import { TimeStep } from '../steps/TimeStep';

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
  return (
    <TimeStep
      availableSlots={availableSlots}
      selectedDate={selectedDate}
      selectedStartTime={selectedStartTime}
      selectedEndTime={selectedEndTime}
      onTimeSlotSelect={onTimeSlotSelect}
      isLoading={isLoading}
      onBack={onBack}
    />
  );
};
