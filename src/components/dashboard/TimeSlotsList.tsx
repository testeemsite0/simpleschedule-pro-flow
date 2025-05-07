import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Check } from 'lucide-react';
import { TimeSlot, TeamMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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
  
  // Sort time slots by day of week and start time
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    if (a.day_of_week === b.day_of_week) {
      return a.start_time.localeCompare(b.start_time);
    }
    return a.day_of_week - b.day_of_week;
  });
  
  const getMemberName = (timeSlot: TimeSlot) => {
    if (!timeSlot.team_member_id) return 'Sem profissional atribuído';
    const member = teamMembers.find(m => m.id === timeSlot.team_member_id);
    return member ? member.name : 'Membro desconhecido';
  };
  
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
      setSelectedTimeSlots(new Set());
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
          variant="outline"
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
            {sortedTimeSlots.map((slot) => (
              <TableRow key={slot.id}>
                {isSelectionMode && (
                  <TableCell>
                    <Checkbox 
                      checked={selectedTimeSlots.has(slot.id)}
                      onCheckedChange={() => toggleTimeSlotSelection(slot.id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{getMemberName(slot)}</Badge>
                </TableCell>
                <TableCell>
                  {dayOfWeekNames[slot.day_of_week]}
                </TableCell>
                <TableCell>
                  {slot.start_time} - {slot.end_time}
                </TableCell>
                <TableCell>
                  {slot.appointment_duration_minutes || 60}
                </TableCell>
                <TableCell>
                  {slot.lunch_break_start && slot.lunch_break_end ? (
                    `${slot.lunch_break_start} - ${slot.lunch_break_end}`
                  ) : (
                    'Sem intervalo'
                  )}
                </TableCell>
                <TableCell>
                  {slot.available ? (
                    <Badge variant="default">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Indisponível</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEdit(slot)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onDelete(slot)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimeSlotsList;
