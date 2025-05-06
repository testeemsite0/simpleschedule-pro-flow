
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientReport {
  totalClients: number;
  topClients: {
    name: string;
    appointments: number;
  }[];
}

interface ClientReportCardProps {
  data: ClientReport;
  loading: boolean;
}

export const ClientReportCard: React.FC<ClientReportCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Clientes</CardTitle>
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
        <CardTitle>Análise de Clientes</CardTitle>
        <CardDescription>Visão geral dos seus clientes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-md">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Clientes</h3>
            <p className="text-3xl font-bold">{data.totalClients}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Top Clientes por Agendamentos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topClients}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#8884d8" name="Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
