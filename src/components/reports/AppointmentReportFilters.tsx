
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import { format } from 'date-fns';

interface AppointmentReportFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  monthYearFilter: string;
  setMonthYearFilter: (value: string) => void;
  clearFilters: () => void;
  onExportCSV: () => void;
  appointments: Appointment[];
}

export const AppointmentReportFilters: React.FC<AppointmentReportFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  dateFilter,
  setDateFilter,
  monthYearFilter,
  setMonthYearFilter,
  clearFilters,
  appointments
}) => {
  const { toast } = useToast();
  
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há agendamentos para exportar com os filtros atuais',
        variant: 'default'
      });
      return;
    }
    
    // Create CSV content
    const headers = [
      'Nome', 'Email', 'Telefone', 'Data', 'Horário', 
      'Status', 'Origem', 'Notas'
    ];
    
    const csvRows = [
      headers.join(','),
      ...appointments.map(a => {
        const formattedDate = format(new Date(a.date), 'dd/MM/yyyy');
        
        // Escape any commas in text fields
        const escapeCsvValue = (value: string) => 
          value ? `"${value.replace(/"/g, '""')}"` : '';
          
        return [
          escapeCsvValue(a.client_name),
          escapeCsvValue(a.client_email),
          escapeCsvValue(a.client_phone || ''),
          formattedDate,
          `${a.start_time} - ${a.end_time}`,
          a.status === 'scheduled' ? 'Agendado' : 
            a.status === 'canceled' ? 'Cancelado' : 'Concluído',
          a.source === 'manual' ? 'Manual' : 'Cliente',
          escapeCsvValue(a.notes || '')
        ].join(',');
      })
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>
          Filtre seus agendamentos para visualização e exportação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Select 
              value={sourceFilter} 
              onValueChange={setSourceFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value) setMonthYearFilter('');
              }}
              placeholder="Data específica"
            />
          </div>
          
          <div className="space-y-2">
            <Input
              type="month"
              value={monthYearFilter}
              onChange={(e) => {
                setMonthYearFilter(e.target.value);
                if (e.target.value) setDateFilter('');
              }}
              placeholder="Mês e Ano"
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleExportCSV}>
            Exportar CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
