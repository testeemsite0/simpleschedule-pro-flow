
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { Pencil, Trash } from 'lucide-react';
import { TimeSlot, TeamMember } from '@/types';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  teamMember: TeamMember | undefined;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  dayOfWeekNames: string[];
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  timeSlot,
  teamMember,
  onEdit,
  onDelete,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  dayOfWeekNames
}) => {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      {isSelectionMode && (
        <TableCell className="w-10">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(timeSlot.id)}
            aria-label="Selecionar horário"
          />
        </TableCell>
      )}
      <TableCell>
        <Badge variant="outline">{teamMember?.name || 'Sem profissional'}</Badge>
      </TableCell>
      <TableCell>
        {dayOfWeekNames[timeSlot.day_of_week]}
      </TableCell>
      <TableCell>
        {timeSlot.start_time} - {timeSlot.end_time}
      </TableCell>
      <TableCell>
        {timeSlot.appointment_duration_minutes || 60}
      </TableCell>
      <TableCell>
        {timeSlot.lunch_break_start && timeSlot.lunch_break_end ? (
          `${timeSlot.lunch_break_start} - ${timeSlot.lunch_break_end}`
        ) : (
          'Sem intervalo'
        )}
      </TableCell>
      <TableCell>
        {timeSlot.available ? (
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
            onClick={() => onEdit(timeSlot)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDelete(timeSlot)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TimeSlotCard;
