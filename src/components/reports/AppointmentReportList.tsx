
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { ReportsDataTable } from './ReportsDataTable';

interface AppointmentReportListProps {
  appointments: Appointment[];
  loading: boolean;
}

export const AppointmentReportList: React.FC<AppointmentReportListProps> = ({ 
  appointments, 
  loading 
}) => {
  // Configurar colunas para o DataTable
  const columns = [
    {
      key: "client",
      header: "Cliente",
      cell: (item: Appointment) => (
        <div>
          <div className="font-medium">{item.client_name}</div>
          <div className="text-sm text-muted-foreground">{item.client_email}</div>
          {item.client_phone && <div className="text-sm text-muted-foreground">{item.client_phone}</div>}
        </div>
      )
    },
    {
      key: "date",
      header: "Data/Horário",
      cell: (item: Appointment) => {
        const date = new Date(item.date);
        return (
          <div>
            <div>{format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}</div>
            <div className="text-sm text-muted-foreground">{item.start_time} - {item.end_time}</div>
          </div>
        );
      }
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Appointment) => {
        let badgeClass = '';
        let statusText = '';
        
        if (item.status === 'scheduled') {
          badgeClass = 'bg-blue-100 text-blue-800';
          statusText = 'Agendado';
        } else if (item.status === 'completed') {
          badgeClass = 'bg-green-100 text-green-800';
          statusText = 'Concluído';
        } else {
          badgeClass = 'bg-red-100 text-red-800';
          statusText = 'Cancelado';
        }
        
        return <Badge variant="outline" className={badgeClass}>{statusText}</Badge>;
      }
    },
    {
      key: "source",
      header: "Origem",
      cell: (item: Appointment) => {
        const sourceClass = item.source === 'client' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-orange-100 text-orange-800';
          
        return (
          <Badge variant="outline" className={sourceClass}>
            {item.source === 'client' ? 'Cliente' : 'Manual'}
          </Badge>
        );
      }
    },
    {
      key: "notes",
      header: "Notas",
      cell: (item: Appointment) => item.notes || '-'
    }
  ];
  
  // Versão alternativa para dispositivos menores
  const AppointmentItem = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = format(appointmentDate, "dd 'de' MMMM, yyyy", {
      locale: ptBR,
    });
    
    return (
      <div className="border rounded-md p-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <div className="flex items-center mb-2 flex-wrap gap-2">
              <h3 className="font-medium mr-2">{appointment.client_name}</h3>
              <Badge variant="outline" className={
                appointment.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800' 
                  : appointment.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }>
                {appointment.status === 'scheduled' 
                  ? 'Agendado' 
                  : appointment.status === 'completed' 
                    ? 'Concluído' 
                    : 'Cancelado'
                }
              </Badge>
              <Badge variant="outline" className={
                appointment.source === 'client' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
              }>
                {appointment.source === 'client' ? 'Cliente' : 'Manual'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {formattedDate} • {appointment.start_time} - {appointment.end_time}
            </p>
            <p className="text-sm text-gray-600 mt-1">{appointment.client_email}</p>
            {appointment.client_phone && (
              <p className="text-sm text-gray-600">{appointment.client_phone}</p>
            )}
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-3 text-sm border-t pt-2">
            <span className="font-medium">Notas: </span>
            {appointment.notes}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Agendamentos</CardTitle>
        <CardDescription>
          {appointments.length} agendamentos encontrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : appointments.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum agendamento encontrado com os filtros atuais.
          </p>
        ) : (
          <>
            {/* DataTable para telas maiores */}
            <div className="hidden md:block">
              <ReportsDataTable
                data={appointments}
                columns={columns}
                loading={loading}
              />
            </div>
            
            {/* Lista para telas menores */}
            <div className="md:hidden space-y-4">
              {appointments.map((appointment) => (
                <AppointmentItem key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
