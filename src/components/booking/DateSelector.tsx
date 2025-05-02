
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
  const handleDateSelect = (date: Date) => {
    onSelectDate(new Date(date));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Escolha uma data
      </h2>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {availableDates.map((date) => {
          // Create a fresh copy of the date to avoid reference issues
          const dateObj = new Date(date.getTime());
          
          return (
            <Button
              key={dateObj.toString()}
              variant={selectedDate && isSameDay(dateObj, selectedDate) ? "default" : "outline"}
              className="min-w-[110px] flex-col h-auto py-2"
              onClick={() => handleDateSelect(dateObj)}
            >
              <span className="text-xs font-normal">
                {format(dateObj, 'EEEE', { locale: ptBR })}
              </span>
              <span className="font-semibold">
                {format(dateObj, 'dd/MM', { locale: ptBR })}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;
