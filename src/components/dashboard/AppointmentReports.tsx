import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { AppointmentReportStats } from '@/components/reports/AppointmentReportStats';
import { AppointmentReportFilters } from '@/components/reports/AppointmentReportFilters';
import { AppointmentReportList } from '@/components/reports/AppointmentReportList';

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
        const typedAppointments = data as Appointment[];
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
    
    // Exportação de CSV implementada no componente AppointmentReportFilters
  };
  
  const clearFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFilter('');
    setMonthYearFilter('');
  };
  
  const filteredAppointments = getFilteredAppointments();
  
  return (
    <div className="space-y-6">
      <AppointmentReportStats stats={stats} />
      
      <AppointmentReportFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        monthYearFilter={monthYearFilter}
        setMonthYearFilter={setMonthYearFilter}
        clearFilters={clearFilters}
        onExportCSV={handleExportCSV}
        appointments={filteredAppointments}
      />
      
      <AppointmentReportList 
        appointments={filteredAppointments}
        loading={loading}
      />
    </div>
  );
};

export default AppointmentReports;
