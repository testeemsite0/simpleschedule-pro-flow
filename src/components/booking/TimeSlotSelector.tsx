
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Horários disponíveis
      </h2>
      
      {availableSlots.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Não há horários disponíveis para esta data.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {availableSlots.map((slot, index) => (
            <Button
              key={`${slot.date.toISOString()}-${slot.startTime}-${slot.endTime}`}
              variant={selectedSlotIndex === index ? "default" : "outline"}
              className="h-auto py-3 flex justify-center items-center text-center"
              onClick={() => handleSelectTimeSlot(slot, index)}
            >
              {slot.startTime} - {slot.endTime}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
