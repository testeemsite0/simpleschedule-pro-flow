
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CalendarIcon, UsersIcon, TrendingUpIcon, CheckIcon, XIcon } from 'lucide-react';
import { FullPageLoadingState } from '@/components/ui/loading-states';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch appointment stats
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, status, created_at')
          .eq('professional_id', user.id);
          
        if (appointmentsError) throw appointmentsError;
        
        // Count appointments by status
        const scheduledCount = appointments?.filter(a => a.status === 'scheduled').length || 0;
        const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;
        const canceledCount = appointments?.filter(a => a.status === 'canceled').length || 0;
        
        // Fetch client count
        const { count: clientCount, error: clientError } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('professional_id', user.id);
          
        if (clientError) throw clientError;
        
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
        
        // Fetch team member count
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('id')
          .eq('professional_id', user.id)
          .eq('active', true);
          
        if (teamMembersError) throw teamMembersError;
        
        // Update stats
        setStats({
          totalAppointments: appointments?.length || 0,
          scheduledAppointments: scheduledCount,
          completedAppointments: completedCount,
          canceledAppointments: canceledCount,
          totalClients: clientCount || 0,
          newClientsThisMonth: newClientsCount || 0,
          teamMembers: teamMembers?.length || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  if (authLoading) {
    return <FullPageLoadingState message="Carregando seu painel..." />;
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sessão Expirada</CardTitle>
            <CardDescription>
              Por favor, faça login novamente para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="block w-full bg-primary text-white py-2 px-4 rounded text-center">
              Fazer Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <DashboardLayout title="Visão Geral">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Appointment Stats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Total de Agendamentos</CardTitle>
                <CardDescription>Estatísticas do período</CardDescription>
              </div>
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <div className="grid grid-cols-3 gap-1 mt-4">
                    <div className="flex flex-col items-center p-2 bg-primary/10 rounded">
                      <span className="text-xs text-muted-foreground">Agendados</span>
                      <div className="font-bold mt-1">
                        {stats.scheduledAppointments}
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-green-500/10 rounded">
                      <span className="text-xs text-muted-foreground">Concluídos</span>
                      <div className="font-bold mt-1 text-green-600 flex items-center gap-1">
                        <CheckIcon className="h-3 w-3" />
                        {stats.completedAppointments}
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-red-500/10 rounded">
                      <span className="text-xs text-muted-foreground">Cancelados</span>
                      <div className="font-bold mt-1 text-red-600 flex items-center gap-1">
                        <XIcon className="h-3 w-3" />
                        {stats.canceledAppointments}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Link 
                to="/dashboard/unified-booking" 
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Gerenciar Agendamentos
              </Link>
            </CardFooter>
          </Card>

          {/* Client Stats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Clientes</CardTitle>
                <CardDescription>Dados de clientes</CardDescription>
              </div>
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Novos este mês</span>
                      <div className="font-medium">{stats.newClientsThisMonth}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Link 
                to="/dashboard/clients" 
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Ver Clientes
              </Link>
            </CardFooter>
          </Card>

          {/* Team Stats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Equipe</CardTitle>
                <CardDescription>Membros da equipe</CardDescription>
              </div>
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.teamMembers}</div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profissionais ativos</span>
                      <div className="font-medium">{stats.teamMembers}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Link 
                to="/dashboard/team" 
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Gerenciar Equipe
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />
              Link de Agendamento
            </CardTitle>
            <CardDescription>
              Compartilhe seu link personalizado para receber agendamentos online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-accent/30 rounded-md border border-accent">
              <p className="text-sm text-muted-foreground mb-2">Seu link para agendamentos:</p>
              <p className="font-medium break-all">
                {window.location.origin}/booking/{user?.slug || ''}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              to="/dashboard/booking-link" 
              className="text-sm text-primary hover:underline w-full text-center"
            >
              Configurar Link de Agendamento
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
