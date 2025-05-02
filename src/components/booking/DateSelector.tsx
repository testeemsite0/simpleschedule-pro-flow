
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface DateSelectorProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  availableDates,
  selectedDate,
  onSelectDate
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Escolha uma data
      </h2>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {availableDates.map((date) => (
          <Button
            key={date.toString()}
            variant={isSameDay(date, selectedDate || new Date()) ? "default" : "outline"}
            className="min-w-[110px] flex-col h-auto py-2"
            onClick={() => onSelectDate(date)}
          >
            <span className="text-xs font-normal">
              {format(date, 'EEEE', { locale: ptBR })}
            </span>
            <span className="font-semibold">
              {format(date, 'dd/MM', { locale: ptBR })}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DateSelector;
