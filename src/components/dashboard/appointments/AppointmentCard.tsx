
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AppointmentCardProps {
  appointment: Appointment;
  teamMemberName?: string;
  insurancePlanName?: string;
  onCancel: (id: string) => void;
}

const AppointmentCard = ({
  appointment,
  teamMemberName,
  insurancePlanName,
  onCancel
}: AppointmentCardProps) => {
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <Card key={appointment.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <div className="flex items-center mb-2">
            <h3 className="font-medium mr-3">{appointment.client_name}</h3>
            <Badge variant="outline" className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {formattedDate} • {appointment.start_time} - {appointment.end_time}
          </p>
          <p className="text-sm text-gray-600 mt-1">{appointment.client_email}</p>
          {appointment.client_phone && (
            <p className="text-sm text-gray-600">{appointment.client_phone}</p>
          )}
          
          {/* Additional information: team member and insurance plan */}
          <div className="mt-2 flex flex-wrap gap-2">
            {teamMemberName && (
              <Badge variant="secondary" className="text-xs font-normal">
                Profissional: {teamMemberName}
              </Badge>
            )}
            
            {insurancePlanName ? (
              <Badge variant="secondary" className="text-xs font-normal">
                Convênio: {insurancePlanName}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                Particular
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-3 sm:mt-0">
          {appointment.status === 'scheduled' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCancel(appointment.id)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
      
      {appointment.notes && (
        <div className="mt-3 text-sm border-t pt-2">
          <span className="font-medium">Notas: </span>
          {appointment.notes}
        </div>
      )}
    </Card>
  );
};

export default AppointmentCard;
