
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
  // Criar uma cópia segura da data antes de passá-la para o evento de clique
  const handleDateSelect = (date: Date) => {
    const safeDateCopy = new Date(date);
    onSelectDate(safeDateCopy);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Escolha uma data
      </h2>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {availableDates.map((date) => {
          // Criar uma cópia segura da data para comparação
          const dateObj = new Date(date);
          const isSelected = selectedDate && isSameDay(dateObj, selectedDate);
          
          return (
            <Button
              key={dateObj.toISOString()}
              variant={isSelected ? "default" : "outline"}
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
