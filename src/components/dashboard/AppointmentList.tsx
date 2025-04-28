
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppointments } from '@/context/AppointmentContext';
import { Badge } from '@/components/ui/badge';

interface AppointmentListProps {
  appointments: Appointment[];
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  const { cancelAppointment } = useAppointments();
  
  if (appointments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
      </Card>
    );
  }
  
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
  
  const handleCancel = async (id: string) => {
    if (window.confirm('Deseja realmente cancelar este agendamento?')) {
      await cancelAppointment(id);
    }
  };
  
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = format(appointmentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        
        return (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="font-medium mr-3">{appointment.clientName}</h3>
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {formattedDate} • {appointment.startTime} - {appointment.endTime}
                </p>
                <p className="text-sm text-gray-600 mt-1">{appointment.clientEmail}</p>
                {appointment.clientPhone && (
                  <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                )}
              </div>
              
              <div className="mt-3 sm:mt-0">
                {appointment.status === 'scheduled' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancel(appointment.id)}
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
      })}
    </div>
  );
};

export default AppointmentList;
