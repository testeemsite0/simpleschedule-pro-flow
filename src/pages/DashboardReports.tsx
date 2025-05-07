
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentReportCard } from '@/components/reports/AppointmentReportCard';
import { ClientReportCard } from '@/components/reports/ClientReportCard';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import AppointmentReports from '@/components/dashboard/AppointmentReports';

const DashboardReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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
    },
    appointmentsByMonth: [] as { month: string; count: number }[]
  });
  
  const [clientReport, setClientReport] = useState({
    totalClients: 0,
    topClients: [] as { name: string; appointments: number }[],
    newClientsThisMonth: 0
  });
  
  const [revenueReport, setRevenueReport] = useState({
    totalRevenue: 0,
    revenueByService: [] as { service: string; revenue: number }[],
    revenueByMonth: [] as { month: string; revenue: number }[]
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
        .select('status, source, date, price')
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
        
        // Monthly breakdown
        const monthlyData = {};
        
        // Revenue data
        let totalRevenue = 0;
        
        appointmentsData.forEach(appointment => {
          // Count by status
          if (appointment.status === 'scheduled') statusCounts.scheduled++;
          else if (appointment.status === 'completed') statusCounts.completed++;
          else if (appointment.status === 'canceled') statusCounts.canceled++;
          
          // Count by source
          if (appointment.source === 'client') sourceCounts.client++;
          else if (appointment.source === 'manual') sourceCounts.manual++;
          
          // Monthly breakdown
          if (appointment.date) {
            const date = new Date(appointment.date);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            if (!monthlyData[monthYear]) {
              monthlyData[monthYear] = { count: 0, revenue: 0 };
            }
            
            monthlyData[monthYear].count++;
            
            // Add revenue if available
            if (appointment.price) {
              totalRevenue += Number(appointment.price);
              monthlyData[monthYear].revenue += Number(appointment.price);
            }
          }
        });
        
        // Convert monthly data to array for charts
        const appointmentsByMonth = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          count: data.count
        })).sort((a, b) => {
          // Sort by date (assuming format "MMM YYYY")
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });
        
        const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          revenue: data.revenue
        })).sort((a, b) => {
          // Sort by date (assuming format "MMM YYYY")
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });
        
        setAppointmentReport({
          totalAppointments: appointmentsData.length,
          appointmentsByStatus: statusCounts,
          appointmentsBySource: sourceCounts,
          appointmentsByMonth
        });
        
        setRevenueReport({
          totalRevenue,
          revenueByService: [], // Will populate from service data
          revenueByMonth
        });
      }
      
      // Fetch client statistics
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, total_appointments, created_at')
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
      
      // Count new clients this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newClientsCount, error: newClientsError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (newClientsError) throw newClientsError;
      
      if (clientsData) {
        setClientReport({
          totalClients: totalClients || 0,
          topClients: clientsData.map(client => ({
            name: client.name,
            appointments: client.total_appointments || 0
          })),
          newClientsThisMonth: newClientsCount || 0
        });
      }
      
      // Fetch revenue by service
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name')
        .eq('professional_id', user.id);
      
      if (servicesError) throw servicesError;
      
      if (servicesData && appointmentsData) {
        const serviceRevenue = {};
        
        // Initialize service revenue map
        servicesData.forEach(service => {
          serviceRevenue[service.id] = {
            name: service.name,
            revenue: 0
          };
        });
        
        // Sum up revenue by service
        appointmentsData.forEach(appointment => {
          if (appointment.service_id && appointment.price && serviceRevenue[appointment.service_id]) {
            serviceRevenue[appointment.service_id].revenue += Number(appointment.price);
          }
        });
        
        // Convert to array for charts
        const revenueByService = Object.values(serviceRevenue)
          .map(({ name, revenue }) => ({ service: name, revenue }))
          .sort((a, b) => b.revenue - a.revenue);
        
        setRevenueReport(prev => ({
          ...prev,
          revenueByService
        }));
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="revenue">Financeiro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{appointmentReport.totalAppointments}</div>
                  <p className="text-sm text-muted-foreground">
                    {appointmentReport.appointmentsByStatus.scheduled} agendados, {appointmentReport.appointmentsByStatus.completed} concluídos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{clientReport.totalClients}</div>
                  <p className="text-sm text-muted-foreground">
                    {clientReport.newClientsThisMonth} novos este mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Faturamento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    R$ {revenueReport.totalRevenue.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppointmentReportCard 
                data={appointmentReport}
                loading={loading}
              />
              
              <ClientReportCard 
                data={clientReport}
                loading={loading}
              />
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={fetchReportData} className="flex items-center gap-2">
                <FileDown size={16} />
                Atualizar dados
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="appointments">
            <AppointmentReports />
          </TabsContent>
          
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Clientes</CardTitle>
                <CardDescription>Estatísticas e dados dos seus clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Financeiro</CardTitle>
                <CardDescription>Análise de faturamento e financeiro</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
