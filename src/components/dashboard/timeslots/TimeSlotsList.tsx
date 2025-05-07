
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeSlot, TeamMember } from '@/types';
import { AlertTriangle } from 'lucide-react';
import GroupedTimeSlots from './GroupedTimeSlots';

interface TimeSlotsListProps {
  timeSlots: TimeSlot[];
  teamMembers: TeamMember[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
  onBatchDelete?: (timeSlotIds: string[]) => void;
}

const dayOfWeekNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({ 
  timeSlots, 
  teamMembers, 
  onEdit, 
  onDelete,
  onBatchDelete
}) => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Group time slots by day of week
  const timeSlotsByDay = useMemo(() => {
    const grouped: Record<number, TimeSlot[]> = {};
    
    timeSlots.forEach(slot => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    
    // Sort keys by day of week
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map(day => ({
        day,
        slots: grouped[day]
      }));
  }, [timeSlots]);
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // Clear selections when exiting selection mode
      setSelectedTimeSlots(new Set());
    }
  };
  
  const toggleTimeSlotSelection = (id: string) => {
    const newSelection = new Set(selectedTimeSlots);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTimeSlots(newSelection);
  };
  
  const selectAllTimeSlots = () => {
    if (selectedTimeSlots.size === timeSlots.length) {
      // If all are selected, clear selection
      setSelectedTimeSlots(new Set());
    } else {
      // Otherwise, select all
      const allIds = new Set(timeSlots.map(slot => slot.id));
      setSelectedTimeSlots(allIds);
    }
  };
  
  const handleBatchDelete = () => {
    if (onBatchDelete && selectedTimeSlots.size > 0) {
      onBatchDelete(Array.from(selectedTimeSlots));
    }
  };
  
  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum horário configurado. Adicione seu primeiro horário para começar.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant={isSelectionMode ? "secondary" : "outline"}
          onClick={toggleSelectionMode}
          className="flex items-center gap-2"
        >
          <Checkbox checked={isSelectionMode} />
          {isSelectionMode ? 'Cancelar seleção' : 'Selecionar horários'}
        </Button>
        
        {isSelectionMode && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={selectAllTimeSlots}
              disabled={timeSlots.length === 0}
            >
              {selectedTimeSlots.size === timeSlots.length 
                ? 'Desmarcar todos' 
                : 'Selecionar todos'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBatchDelete}
              disabled={selectedTimeSlots.size === 0}
            >
              Excluir selecionados ({selectedTimeSlots.size})
            </Button>
          </div>
        )}
      </div>
      
      {selectedTimeSlots.size > 0 && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            {selectedTimeSlots.size} horário(s) selecionado(s). Use o botão "Excluir selecionados" para remover todos de uma vez.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionMode && <TableHead className="w-12"></TableHead>}
              <TableHead>Profissional</TableHead>
              <TableHead>Dia da semana</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Duração (min)</TableHead>
              <TableHead>Intervalo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlotsByDay.map(({ day, slots }) => (
              <GroupedTimeSlots
                key={day}
                dayOfWeek={day}
                timeSlots={slots}
                teamMembers={teamMembers}
                onEdit={onEdit}
                onDelete={onDelete}
                isSelectionMode={isSelectionMode}
                selectedTimeSlots={selectedTimeSlots}
                onToggleSelection={toggleTimeSlotSelection}
                dayOfWeekNames={dayOfWeekNames}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimeSlotsList;
