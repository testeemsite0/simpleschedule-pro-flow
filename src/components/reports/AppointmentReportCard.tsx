
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
  appointmentsByMonth?: Array<{
    month: string;
    count: number;
  }>;
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
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Análise de Agendamentos</CardTitle>
        <CardDescription>Visão geral dos seus agendamentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {data.appointmentsByMonth && data.appointmentsByMonth.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-medium">Agendamentos por Mês</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.appointmentsByMonth}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={60}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Agendamentos']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Agendamentos" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
