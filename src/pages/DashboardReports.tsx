
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentReportCard } from '@/components/reports/AppointmentReportCard';
import { ClientReportCard } from '@/components/reports/ClientReportCard';

const DashboardReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Report data states
  const [appointmentReport, setAppointmentReport] = useState({
    totalAppointments: 0,
    appointmentsByStatus: {
      scheduled: 0,
      completed: 0,
      canceled: 0
    },
    appointmentsBySource: {
      client: 0,
      manual: 0
    }
  });
  
  const [clientReport, setClientReport] = useState({
    totalClients: 0,
    topClients: [] as { name: string; appointments: number }[]
  });
  
  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);
  
  const fetchReportData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch appointment statistics
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status, source')
        .eq('professional_id', user.id);
      
      if (appointmentsError) throw appointmentsError;
      
      if (appointmentsData) {
        // Count appointments by status
        const statusCounts = {
          scheduled: 0,
          completed: 0,
          canceled: 0
        };
        
        // Count appointments by source
        const sourceCounts = {
          client: 0,
          manual: 0
        };
        
        appointmentsData.forEach(appointment => {
          // Count by status
          if (appointment.status === 'scheduled') statusCounts.scheduled++;
          else if (appointment.status === 'completed') statusCounts.completed++;
          else if (appointment.status === 'canceled') statusCounts.canceled++;
          
          // Count by source
          if (appointment.source === 'client') sourceCounts.client++;
          else if (appointment.source === 'manual') sourceCounts.manual++;
        });
        
        setAppointmentReport({
          totalAppointments: appointmentsData.length,
          appointmentsByStatus: statusCounts,
          appointmentsBySource: sourceCounts
        });
      }
      
      // Fetch client statistics
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, total_appointments')
        .eq('professional_id', user.id)
        .order('total_appointments', { ascending: false })
        .limit(5);
      
      if (clientsError) throw clientsError;
      
      // Get total clients count
      const { count: totalClients, error: countError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', user.id);
      
      if (countError) throw countError;
      
      if (clientsData) {
        setClientReport({
          totalClients: totalClients || 0,
          topClients: clientsData.map(client => ({
            name: client.name,
            appointments: client.total_appointments || 0
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos relatórios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout title="Relatórios">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Visualize relatórios e estatísticas do seu consultório
        </p>
        
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-4">
            <AppointmentReportCard 
              data={appointmentReport}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-4">
            <ClientReportCard 
              data={clientReport}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
