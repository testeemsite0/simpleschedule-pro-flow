
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { TimeSlot, TeamMember } from '@/types';
import { Badge } from '@/components/ui/badge';

interface TimeSlotsListProps {
  timeSlots: TimeSlot[];
  teamMembers: TeamMember[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
}

const dayOfWeekNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({ timeSlots, teamMembers, onEdit, onDelete }) => {
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
      <Table>
        <TableHeader>
          <TableRow>
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
  );
};

export default TimeSlotsList;
