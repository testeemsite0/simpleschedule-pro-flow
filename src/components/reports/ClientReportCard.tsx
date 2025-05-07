
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientReport {
  totalClients: number;
  newClientsThisMonth?: number;
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
    <Card className="col-span-1">
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
          {data.newClientsThisMonth !== undefined && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground">Novos este mês</h3>
              <p className="text-3xl font-bold">{data.newClientsThisMonth}</p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-medium mb-2">Top Clientes por Agendamentos</h3>
          {data.topClients.length > 0 ? (
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
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Agendamentos']}
                    labelFormatter={(label) => `Cliente: ${label}`}
                  />
                  <Bar 
                    dataKey="appointments" 
                    fill="#8884d8" 
                    name="Agendamentos"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Não há dados de clientes suficientes para gerar um gráfico.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
