
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AppointmentReport {
  totalAppointments: number;
  appointmentsByStatus: {
    scheduled: number;
    completed: number;
    canceled: number;
  };
  appointmentsBySource: {
    client: number;
    manual: number;
  };
}

interface AppointmentReportCardProps {
  data: AppointmentReport;
  loading: boolean;
}

export const AppointmentReportCard: React.FC<AppointmentReportCardProps> = ({ data, loading }) => {
  // Prepare data for pie chart (status)
  const statusData = [
    { name: 'Agendados', value: data.appointmentsByStatus.scheduled, color: '#3B82F6' },
    { name: 'Concluídos', value: data.appointmentsByStatus.completed, color: '#10B981' },
    { name: 'Cancelados', value: data.appointmentsByStatus.canceled, color: '#EF4444' },
  ];

  // Prepare data for pie chart (source)
  const sourceData = [
    { name: 'Cliente', value: data.appointmentsBySource.client, color: '#8B5CF6' },
    { name: 'Manual', value: data.appointmentsBySource.manual, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Agendamentos</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando estatísticas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Agendamentos</CardTitle>
        <CardDescription>Visão geral dos seus agendamentos</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Por Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Por Origem</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4">
            {sourceData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
