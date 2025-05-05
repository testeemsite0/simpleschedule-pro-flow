
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface TimeSlotSelectorProps {
  availableSlots: AvailableSlot[];
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  onSelectSlot
}) => {
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot | null>(null);

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    onSelectSlot(slot.date, slot.startTime, slot.endTime, slot.teamMemberId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Horários disponíveis</h2>
      
      {availableSlots.length === 0 ? (
        <div className="text-center py-8 animate-fade-in">
          <p className="text-gray-600">
            Não há horários disponíveis para esta data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 animate-fade-in">
          {availableSlots.map((slot, index) => (
            <Button
              key={`${slot.startTime}-${index}`}
              variant="outline"
              size="sm"
              className={cn(
                "text-center py-3 h-auto",
                selectedSlot === slot ? "bg-primary text-primary-foreground" : ""
              )}
              onClick={() => handleSelectSlot(slot)}
            >
              {slot.startTime}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
