
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TeamMember } from '@/types';

interface BookingAppointmentSummaryProps {
  professionalName: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: TeamMember;
}

export const BookingAppointmentSummary: React.FC<BookingAppointmentSummaryProps> = ({
  professionalName,
  selectedDate,
  startTime,
  endTime,
  selectedTeamMember
}) => {
  const formattedDate = format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <div className="bg-accent/30 p-3 rounded-md">
      <p className="font-medium">{professionalName}</p>
      <p className="text-sm">{formattedDate}</p>
      <p className="text-sm">{startTime} - {endTime}</p>
      {selectedTeamMember && (
        <Badge className="mt-1">
          Profissional: {selectedTeamMember.name}
        </Badge>
      )}
    </div>
  );
};
