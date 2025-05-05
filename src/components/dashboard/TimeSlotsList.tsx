
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { TimeSlot, TeamMember } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeSlotsListProps {
  timeSlots: TimeSlot[];
  teamMembers?: TeamMember[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete?: (timeSlot: TimeSlot) => void;
}

const days = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({ 
  timeSlots, 
  teamMembers = [],
  onEdit,
  onDelete 
}) => {
  // Separate time slots into global and member-specific
  const globalTimeSlots = useMemo(() => 
    timeSlots.filter(slot => !slot.team_member_id), 
    [timeSlots]
  );
  
  const memberSpecificTimeSlots = useMemo(() => 
    timeSlots.filter(slot => !!slot.team_member_id), 
    [timeSlots]
  );
  
  // Format time to display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Get team member name by ID
  const getTeamMemberName = (teamMemberId: string | null | undefined) => {
    if (!teamMemberId) return 'Geral';
    const member = teamMembers.find(m => m.id === teamMemberId);
    return member ? member.name : 'Profissional desconhecido';
  };
  
  const renderTimeSlotTable = (slots: TimeSlot[]) => {
    if (slots.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          Nenhum horário encontrado.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dia</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead className="hidden md:table-cell">Duração</TableHead>
            {slots === memberSpecificTimeSlots && (
              <TableHead className="hidden md:table-cell">Profissional</TableHead>
            )}
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{days[slot.day_of_week]}</TableCell>
              <TableCell>
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                {slot.lunch_break_start && slot.lunch_break_end && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Almoço: {formatTime(slot.lunch_break_start)} - {formatTime(slot.lunch_break_end)}
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {slot.appointment_duration_minutes} min
              </TableCell>
              {slots === memberSpecificTimeSlots && (
                <TableCell className="hidden md:table-cell">
                  {getTeamMemberName(slot.team_member_id)}
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell">
                {slot.available ? (
                  <Badge variant="success">Disponível</Badge>
                ) : (
                  <Badge variant="secondary">Indisponível</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(slot)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(slot)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="global">Horários Globais</TabsTrigger>
            <TabsTrigger value="member">Horários por Profissional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global">
            {renderTimeSlotTable(globalTimeSlots)}
          </TabsContent>
          
          <TabsContent value="member">
            {renderTimeSlotTable(memberSpecificTimeSlots)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimeSlotsList;
