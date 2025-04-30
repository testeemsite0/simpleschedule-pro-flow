
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, FileDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const AppointmentReports = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, filterStatus, filterDate, filterMonth]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id);
        
      // Apply status filter if not 'all'
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      // Apply date filter if specified
      if (filterDate) {
        const dateString = format(filterDate, 'yyyy-MM-dd');
        query = query.eq('date', dateString);
      } 
      // Apply month filter if date is not specified
      else if (filterMonth) {
        const startDate = format(startOfMonth(filterMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(filterMonth), 'yyyy-MM-dd');
        query = query
          .gte('date', startDate)
          .lte('date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        // Cast the appointment status to the expected union type
        const typedAppointments = data.map(appointment => ({
          ...appointment,
          status: appointment.status as "scheduled" | "completed" | "canceled"
        }));
        
        setAppointments(typedAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (appointments.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há dados para exportar.',
      });
      return;
    }
    
    // Format data for CSV
    const csvRows = [];
    
    // Add header row
    const header = ['Data', 'Hora Início', 'Hora Fim', 'Cliente', 'Email', 'Telefone', 'Status', 'Notas'];
    csvRows.push(header.join(','));
    
    // Add data rows
    for (const appointment of appointments) {
      const row = [
        format(parseISO(appointment.date), 'dd/MM/yyyy'),
        appointment.start_time,
        appointment.end_time,
        appointment.client_name,
        appointment.client_email,
        appointment.client_phone || 'N/A',
        appointment.status === 'scheduled' ? 'Agendado' : 
          appointment.status === 'completed' ? 'Concluído' : 'Cancelado',
        appointment.notes ? `"${appointment.notes.replace(/"/g, '""')}"` : 'N/A'
      ];
      csvRows.push(row.join(','));
    }
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusText = (status: 'scheduled' | 'completed' | 'canceled') => {
    return {
      scheduled: 'Agendado',
      completed: 'Concluído',
      canceled: 'Cancelado'
    }[status] || 'Desconhecido';
  };

  const getStatusColor = (status: 'scheduled' | 'completed' | 'canceled') => {
    return {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate totals
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const canceledAppointments = appointments.filter(a => a.status === 'canceled').length;
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Agendamentos</CardTitle>
          <CardDescription>
            Visualize e filtre seus agendamentos para análise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select 
                value={filterStatus} 
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="canceled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Dia específico</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    disabled={!!filterMonth && filterMonth.getDate() !== new Date().getDate()}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? (
                      format(filterDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Mês</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    disabled={!!filterDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterMonth ? (
                      format(filterMonth, "MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione um mês</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterMonth}
                    onSelect={setFilterMonth}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-none self-end">
              <Button variant="outline" onClick={() => exportToCSV()} disabled={appointments.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledAppointments}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{completedAppointments}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{canceledAppointments}</p>
              </CardContent>
            </Card>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado com os filtros selecionados.
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de agendamentos filtrados.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {appointment.start_time} - {appointment.end_time}
                    </TableCell>
                    <TableCell>{appointment.client_name}</TableCell>
                    <TableCell>{appointment.client_email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentReports;
