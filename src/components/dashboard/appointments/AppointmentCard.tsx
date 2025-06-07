
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { formatDateTimeInTimezone, formatDateInTimezone, formatTimeInTimezone } from '@/utils/dynamicTimezone';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, X } from 'lucide-react';
import { parseISO } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  teamMemberName?: string;
  insurancePlanName?: string;
  onCancel: (id: string) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'canceled':
      return 'bg-red-500';
    case 'no-show':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Agendado';
    case 'completed':
      return 'Concluído';
    case 'canceled':
      return 'Cancelado';
    case 'no-show':
      return 'Faltou';
    default:
      return status;
  }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  teamMemberName,
  insurancePlanName,
  onCancel
}) => {
  const { settings } = useCompanySettings();
  const timezone = settings?.timezone || 'America/Sao_Paulo';

  // Parse the appointment date correctly
  const appointmentDate = parseISO(appointment.date);
  
  console.log('AppointmentCard: Rendering appointment', {
    id: appointment.id,
    rawDate: appointment.date,
    parsedDate: appointmentDate,
    timezone,
    startTime: appointment.start_time,
    endTime: appointment.end_time
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-white ${getStatusColor(appointment.status)}`}
            >
              {getStatusLabel(appointment.status)}
            </Badge>
            {appointment.source && (
              <Badge variant="outline">
                {appointment.source === 'client' ? 'Cliente' : 'Dashboard'}
              </Badge>
            )}
          </div>
          
          {appointment.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(appointment.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {formatDateInTimezone(appointmentDate, timezone, 'EEEE, dd \'de\' MMMM \'de\' yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              {appointment.start_time} - {appointment.end_time}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{appointment.client_name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{appointment.client_email}</span>
          </div>

          {appointment.client_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{appointment.client_phone}</span>
            </div>
          )}

          {teamMemberName && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Profissional: {teamMemberName}</span>
            </div>
          )}

          {insurancePlanName && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span>Convênio: {insurancePlanName}</span>
            </div>
          )}

          {appointment.price && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                R$ {appointment.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {appointment.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
