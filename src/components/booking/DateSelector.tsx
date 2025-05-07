
import React from 'react';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DateSelectorProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ availableDates, selectedDate, onSelectDate }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Selecione uma data</h2>
      
      {availableDates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhuma data disponível para agendamento.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[240px] border rounded-md p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
            {availableDates.map((date) => (
              <Button
                key={date.toISOString()}
                variant="outline"
                className={`h-auto py-3 ${
                  selectedDate && isSameDay(date, selectedDate)
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => onSelectDate(date)}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {format(date, "dd", { locale: ptBR })}
                  </span>
                  <span className="text-xs">
                    {format(date, "EEEE", { locale: ptBR })}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DateSelector;
