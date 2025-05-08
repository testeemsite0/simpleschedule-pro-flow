
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface WorkingDaysSelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

const daysOfWeek = [
  { value: 0, label: 'D' },
  { value: 1, label: 'S' },
  { value: 2, label: 'T' },
  { value: 3, label: 'Q' },
  { value: 4, label: 'Q' },
  { value: 5, label: 'S' },
  { value: 6, label: 'S' }
];

const WorkingDaysSelector: React.FC<WorkingDaysSelectorProps> = ({ selectedDays, onChange }) => {
  const handleValueChange = (values: string[]) => {
    // Convert string values back to numbers
    const days = values.map(v => parseInt(v));
    onChange(days);
  };

  return (
    <ToggleGroup
      type="multiple"
      className="flex justify-between"
      value={selectedDays.map(String)}
      onValueChange={handleValueChange}
    >
      {daysOfWeek.map((day) => (
        <ToggleGroupItem 
          key={day.value} 
          value={String(day.value)} 
          aria-label={`Dia ${day.value}`}
          className="w-10"
        >
          {day.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default WorkingDaysSelector;
