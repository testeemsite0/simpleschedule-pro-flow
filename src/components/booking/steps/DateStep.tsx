
import React from 'react';
import { Button } from '@/components/ui/button';
import DateSelector from '../DateSelector';

interface DateStepProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onBack: () => void;
}

export const DateStep: React.FC<DateStepProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
  onBack
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha uma data
      </h2>
      <DateSelector 
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={onDateSelect}
      />
      
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
