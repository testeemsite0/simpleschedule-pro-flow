
import React from 'react';
import { TimeSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppointments } from '@/context/AppointmentContext';
import { Badge } from '@/components/ui/badge';

interface TimeSlotsListProps {
  timeSlots: TimeSlot[];
  onEdit: (timeSlot: TimeSlot) => void;
}

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({ timeSlots, onEdit }) => {
  const { deleteTimeSlot } = useAppointments();
  
  if (timeSlots.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhum horário configurado.</p>
      </Card>
    );
  }
  
  const getDayName = (dayNumber: number) => {
    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    return days[dayNumber];
  };
  
  // Group time slots by day of week
  const slotsByDay = timeSlots.reduce<Record<number, TimeSlot[]>>((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {});
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este horário?')) {
      await deleteTimeSlot(id);
    }
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(slotsByDay).map(([day, slots]) => (
        <div key={day} className="space-y-3">
          <h3 className="font-medium text-lg">{getDayName(parseInt(day))}</h3>
          
          <div className="space-y-2">
            {slots.map((slot) => (
              <Card key={slot.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </p>
                    
                    <div className="mt-1">
                      <Badge variant={slot.available ? "outline" : "secondary"}>
                        {slot.available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(slot)}
                    >
                      Editar
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeSlotsList;
