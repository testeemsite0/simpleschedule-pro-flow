
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AppointmentStats {
  total: number;
  scheduled: number;
  canceled: number;
  completed: number;
  manual: number;
  client: number;
}

interface AppointmentReportStatsProps {
  stats: AppointmentStats;
}

export const AppointmentReportStats: React.FC<AppointmentReportStatsProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Agendamentos</CardTitle>
        <CardDescription>Visão geral dos seus agendamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Agendados</p>
            <p className="text-2xl font-semibold">{stats.scheduled}</p>
          </div>
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Concluídos</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Cancelados</p>
            <p className="text-2xl font-semibold">{stats.canceled}</p>
          </div>
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Agendados pelo Cliente</p>
            <p className="text-2xl font-semibold">{stats.client}</p>
          </div>
          <div className="p-4 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground">Agendados Manualmente</p>
            <p className="text-2xl font-semibold">{stats.manual}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
