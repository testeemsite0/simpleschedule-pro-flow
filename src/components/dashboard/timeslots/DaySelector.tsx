
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DaySelectorProps {
  dayOfWeek: string;
  setDayOfWeek: (value: string) => void;
  selectedDays: Record<string, boolean>;
  handleDayToggle: (day: string) => void;
  batchMode: boolean;
}

const dayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

const DaySelector: React.FC<DaySelectorProps> = ({
  dayOfWeek,
  setDayOfWeek,
  selectedDays,
  handleDayToggle,
  batchMode
}) => {
  return (
    <div className="space-y-2">
      <Label>
        Dia(s) da semana <span className="text-destructive">*</span>
      </Label>
      
      {batchMode ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {dayOptions.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`day-${day.value}`}
                checked={selectedDays[day.value] || false}
                onCheckedChange={() => handleDayToggle(day.value)}
              />
              <Label 
                htmlFor={`day-${day.value}`}
                className="text-sm cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <Select
          value={dayOfWeek}
          onValueChange={setDayOfWeek}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o dia" />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DaySelector;
