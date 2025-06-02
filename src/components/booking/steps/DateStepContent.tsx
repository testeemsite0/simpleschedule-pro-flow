
import React from 'react';
import { DateStep } from './DateStep';

interface DateStepContentProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isLoading?: boolean;
}

export const DateStepContent: React.FC<DateStepContentProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
  isLoading = false
}) => {
  // Log available dates for debugging
  console.log("DateStepContent: Rendering with", 
    availableDates.length, "available dates", 
    selectedDate ? `Selected: ${selectedDate.toISOString().split('T')[0]}` : "No date selected"
  );

  return (
    <DateStep
      availableDates={availableDates}
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
    />
  );
};
