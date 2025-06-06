
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { filterPastSlots } from './improved-time-utils';
import { ImprovedLoading } from '@/components/ui/improved-loading';

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
  isLoading?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  onSelectSlot,
  showConfirmButton = false,
  isLoading = false
}) => {
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot | null>(null);

  // Filter out past slots using improved timezone handling
  const filteredSlots = React.useMemo(() => {
    console.log('TimeSlotSelector: Filtering', availableSlots.length, 'slots');
    const filtered = filterPastSlots(availableSlots);
    console.log('TimeSlotSelector: After filtering past slots:', filtered.length, 'remaining');
    return filtered;
  }, [availableSlots]);

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    
    // Only call the parent component's onSelectSlot function if showConfirmButton is false
    if (!showConfirmButton) {
      console.log("TimeSlotSelector: Immediately selecting slot", slot);
      onSelectSlot(slot.date, slot.startTime, slot.endTime, slot.teamMemberId);
    }
  };
  
  const handleConfirmSelection = () => {
    if (selectedSlot) {
      console.log("TimeSlotSelector: Confirming slot selection", selectedSlot);
      onSelectSlot(
        selectedSlot.date, 
        selectedSlot.startTime, 
        selectedSlot.endTime, 
        selectedSlot.teamMemberId
      );
    }
  };

  if (isLoading) {
    return <ImprovedLoading variant="calendar" message="Carregando horários disponíveis..." />;
  }

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
          <ScrollArea className="h-[280px] rounded-md border">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4">
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
          </ScrollArea>
          
          {showConfirmButton && selectedSlot && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleConfirmSelection} className="bg-primary hover:bg-primary/90">
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
