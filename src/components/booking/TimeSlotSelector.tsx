
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isAfter, isSameDay, parse, format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

interface TimeSlotSelectorProps {
  availableSlots: AvailableSlot[];
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
  showConfirmButton?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  onSelectSlot,
  showConfirmButton = false
}) => {
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot | null>(null);

  // Filter slots that have already passed
  const filteredSlots = React.useMemo(() => {
    const now = new Date();
    
    return availableSlots.filter(slot => {
      // Check if the slot date is today or future
      const slotDate = new Date(slot.date);
      const isToday = isSameDay(slotDate, now);
      const isFutureDay = isAfter(slotDate, now);
      
      // If it's a future day, it's always valid
      if (isFutureDay && !isToday) {
        return true;
      }
      
      // If it's today, check if the time has already passed
      if (isToday) {
        // Parse the time string to get hours and minutes
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        
        // Create a new date object with today's date but with the slot's time
        const slotDateTime = new Date();
        slotDateTime.setHours(hours, minutes, 0, 0);
        
        // Return true only if the time hasn't passed yet
        return isAfter(slotDateTime, now);
      }
      
      // For past dates, return false
      return false;
    });
  }, [availableSlots]);

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    
    // Only call the parent component's onSelectSlot function if showConfirmButton is false
    // This prevents immediately advancing to the next step
    if (!showConfirmButton) {
      onSelectSlot(slot.date, slot.startTime, slot.endTime, slot.teamMemberId);
    }
  };
  
  const handleConfirmSelection = () => {
    if (selectedSlot) {
      onSelectSlot(
        selectedSlot.date, 
        selectedSlot.startTime, 
        selectedSlot.endTime, 
        selectedSlot.teamMemberId
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Horários disponíveis</h2>
      
      {filteredSlots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Não há horários disponíveis para esta data.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-[280px] overflow-auto border rounded-md p-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-1">
              {filteredSlots.map((slot, index) => (
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
          </div>
          
          {showConfirmButton && selectedSlot && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleConfirmSelection}>
                Confirmar Horário
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
