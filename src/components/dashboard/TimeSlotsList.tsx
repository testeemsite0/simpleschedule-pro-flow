
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { TimeSlot, TeamMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeSlotsListProps {
  timeSlots: TimeSlot[];
  teamMembers: TeamMember[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
}

const dayOfWeekNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({ timeSlots, teamMembers, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Filter time slots by type
  const globalTimeSlots = timeSlots.filter(slot => !slot.team_member_id);
  const memberTimeSlots = timeSlots.filter(slot => slot.team_member_id);
  
  const displayTimeSlots = activeTab === 'all' 
    ? timeSlots 
    : activeTab === 'global' 
      ? globalTimeSlots 
      : memberTimeSlots;

  // Sort time slots by day of week and start time
  const sortedTimeSlots = [...displayTimeSlots].sort((a, b) => {
    if (a.day_of_week === b.day_of_week) {
      return a.start_time.localeCompare(b.start_time);
    }
    return a.day_of_week - b.day_of_week;
  });
  
  const getMemberName = (timeSlot: TimeSlot) => {
    if (!timeSlot.team_member_id) return 'Global';
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="global">Globais</TabsTrigger>
          <TabsTrigger value="member">Por Profissional</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TimeSlotTable 
            timeSlots={sortedTimeSlots} 
            getMemberName={getMemberName} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        </TabsContent>
        
        <TabsContent value="global" className="mt-4">
          {globalTimeSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum horário global configurado.</p>
            </div>
          ) : (
            <TimeSlotTable 
              timeSlots={globalTimeSlots.sort((a, b) => {
                if (a.day_of_week === b.day_of_week) {
                  return a.start_time.localeCompare(b.start_time);
                }
                return a.day_of_week - b.day_of_week;
              })} 
              getMemberName={getMemberName} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="member" className="mt-4">
          {memberTimeSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum horário específico por profissional configurado.</p>
            </div>
          ) : (
            <TimeSlotTable 
              timeSlots={memberTimeSlots.sort((a, b) => {
                if (a.day_of_week === b.day_of_week) {
                  return a.start_time.localeCompare(b.start_time);
                }
                return a.day_of_week - b.day_of_week;
              })} 
              getMemberName={getMemberName} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separated table component to avoid duplication
const TimeSlotTable = ({ 
  timeSlots, 
  getMemberName, 
  onEdit, 
  onDelete 
}: { 
  timeSlots: TimeSlot[], 
  getMemberName: (slot: TimeSlot) => string,
  onEdit: (slot: TimeSlot) => void,
  onDelete: (slot: TimeSlot) => void
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dia da semana</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Duração (min)</TableHead>
          <TableHead>Intervalo</TableHead>
          <TableHead>Profissional</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {timeSlots.map((slot) => (
          <TableRow key={slot.id}>
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
              {slot.team_member_id ? (
                <Badge variant="outline">{getMemberName(slot)}</Badge>
              ) : (
                <Badge variant="secondary">Global</Badge>
              )}
            </TableCell>
            <TableCell>
              {slot.available ? (
                <Badge variant="success">Disponível</Badge>
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
  );
};

export default TimeSlotsList;
