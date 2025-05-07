
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

  if (availableDates.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhuma data disponível.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-2 h-[300px] overflow-auto p-2 border rounded-md">
        {availableDates.map((date) => {
          // Criar uma cópia segura da data para comparação
          const dateObj = new Date(date);
          const isSelected = selectedDate && isSameDay(dateObj, selectedDate);
          
          return (
            <Button
              key={dateObj.toISOString()}
              variant={isSelected ? "default" : "outline"}
              className="flex-col h-auto py-3 text-sm"
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
