
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

const AppointmentReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [monthYearFilter, setMonthYearFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    canceled: 0,
    completed: 0,
    manual: 0,
    client: 0
  });
  
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);
  
  const fetchAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const typedAppointments = data.map(app => ({
          ...app,
          source: app.source || 'client' // Default for older records
        })) as Appointment[];
        
        setAppointments(typedAppointments);
        
        // Calculate statistics
        const stats = {
          total: typedAppointments.length,
          scheduled: typedAppointments.filter(a => a.status === 'scheduled').length,
          canceled: typedAppointments.filter(a => a.status === 'canceled').length,
          completed: typedAppointments.filter(a => a.status === 'completed').length,
          manual: typedAppointments.filter(a => a.source === 'manual').length,
          client: typedAppointments.filter(a => a.source === 'client').length
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus agendamentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter by status
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Filter by source (manual/client)
      if (sourceFilter !== 'all' && appointment.source !== sourceFilter) {
        return false;
      }
      
      // Filter by specific date
      if (dateFilter) {
        if (appointment.date !== dateFilter) {
          return false;
        }
      }
      
      // Filter by month and year
      if (monthYearFilter) {
        const [year, month] = monthYearFilter.split('-');
        const appointmentDate = new Date(appointment.date);
        
        if (
          appointmentDate.getFullYear() !== parseInt(year) || 
          appointmentDate.getMonth() + 1 !== parseInt(month)
        ) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const handleExportCSV = () => {
    const filteredAppointments = getFilteredAppointments();
    
    if (filteredAppointments.length === 0) {
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
      ...filteredAppointments.map(a => {
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
  
  const filteredAppointments = getFilteredAppointments();
  
  const clearFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFilter('');
    setMonthYearFilter('');
  };
  
  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>
            {filteredAppointments.length} agendamentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando agendamentos...</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Nenhum agendamento encontrado com os filtros atuais.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const formattedDate = format(appointmentDate, "dd 'de' MMMM, yyyy", {
                  locale: ptBR,
                });
                
                return (
                  <div key={appointment.id} className="border rounded-md p-4">
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
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentReports;
