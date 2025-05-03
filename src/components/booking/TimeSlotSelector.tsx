
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

interface TimeSlotSelectorProps {
  availableSlots: TimeSlot[];
  onSelectSlot: (date: Date, startTime: string, endTime: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  onSelectSlot
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const handleSelectTimeSlot = (slot: TimeSlot, index: number) => {
    setSelectedSlotIndex(index);
    onSelectSlot(new Date(slot.date), slot.startTime, slot.endTime);
  };

  // Group time slots into rows of 2 for better display in the dialog
  const groupedSlots = () => {
    const grouped = [];
    for (let i = 0; i < availableSlots.length; i += 2) {
      grouped.push(availableSlots.slice(i, i + 2));
    }
    return grouped;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Horários disponíveis
      </h2>
      
      {availableSlots.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Não há horários disponíveis para esta data.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groupedSlots().map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-2 gap-3">
              {row.map((slot, colIndex) => {
                const index = rowIndex * 2 + colIndex;
                return (
                  <Button
                    key={`${slot.date.toISOString()}-${slot.startTime}-${slot.endTime}`}
                    variant={selectedSlotIndex === index ? "default" : "outline"}
                    className="w-full h-auto py-2 px-2 text-sm text-center whitespace-nowrap"
                    onClick={() => handleSelectTimeSlot(slot, index)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                );
              })}
              {/* Add empty slots to complete the row if needed */}
              {row.length < 2 && Array(2 - row.length).fill(0).map((_, i) => (
                <div key={`empty-${rowIndex}-${i}`} className="w-full"></div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
