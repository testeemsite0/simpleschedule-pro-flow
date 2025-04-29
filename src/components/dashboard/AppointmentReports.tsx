
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '@/context/AppointmentContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, DownloadIcon, FilterIcon, SearchIcon } from 'lucide-react';
import { Appointment } from '@/types';

const AppointmentReports = () => {
  const { getAppointmentsByProfessional } = useAppointments();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [monthYearFilter, setMonthYearFilter] = useState('');
  
  // References for CSV export
  const tableRef = useRef<HTMLTableElement>(null);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await getAppointmentsByProfessional(user.id);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user, getAppointmentsByProfessional]);
  
  // Apply filters whenever filter values change
  useEffect(() => {
    if (appointments.length === 0) return;
    
    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    // Apply specific date filter
    if (dateFilter) {
      filtered = filtered.filter(appointment => 
        appointment.date === dateFilter
      );
    }
    
    // Apply month and year filter
    if (monthYearFilter) {
      const [year, month] = monthYearFilter.split('-');
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === parseInt(year) && 
          appointmentDate.getMonth() === parseInt(month) - 1
        );
      });
    }
    
    setFilteredAppointments(filtered);
  }, [statusFilter, dateFilter, monthYearFilter, appointments]);
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };
  
  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value);
    // Clear month/year filter when a specific date is selected
    if (event.target.value) {
      setMonthYearFilter('');
    }
  };
  
  const handleMonthYearFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthYearFilter(event.target.value);
    // Clear specific date filter when a month/year is selected
    if (event.target.value) {
      setDateFilter('');
    }
  };
  
  const resetFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setMonthYearFilter('');
  };
  
  const exportToCSV = () => {
    if (!tableRef.current) return;
    
    // Convert table data to CSV
    const rows = Array.from(tableRef.current.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th,td'));
      return cells.map(cell => `"${cell.textContent?.replace(/"/g, '""')}"`).join(',');
    }).join('\n');
    
    // Create download link
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-agendamentos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Count totals for summary
  const countByStatus = {
    scheduled: filteredAppointments.filter(a => a.status === 'scheduled').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length,
    canceled: filteredAppointments.filter(a => a.status === 'canceled').length,
    total: filteredAppointments.length
  };
  
  if (loading) {
    return <Card><CardContent className="p-6">Carregando relatórios...</CardContent></Card>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FilterIcon className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter">Data Específica</Label>
              <div className="relative">
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  className="w-full"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="month-year-filter">Mês e Ano</Label>
              <Input
                id="month-year-filter"
                type="month"
                value={monthYearFilter}
                onChange={handleMonthYearFilterChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Limpar Filtros
            </Button>
            
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Agendados</p>
              <p className="text-3xl font-bold">{countByStatus.scheduled}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Concluídos</p>
              <p className="text-3xl font-bold">{countByStatus.completed}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Cancelados</p>
              <p className="text-3xl font-bold">{countByStatus.canceled}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-800 font-medium">Total</p>
              <p className="text-3xl font-bold">{countByStatus.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex justify-between items-center">
            <span className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" /> Resultado da Pesquisa
            </span>
            <span className="text-sm text-muted-foreground">
              {filteredAppointments.length} agendamentos encontrados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table ref={tableRef}>
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
                  {filteredAppointments.map(appointment => (
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
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentReports;
