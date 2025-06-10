
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CalendarIcon, UsersIcon, CheckIcon, XIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching dashboard stats for user:", user.id);
        
        // Use Promise.allSettled to handle individual failures gracefully
        const results = await Promise.allSettled([
          supabase
            .from('appointments')
            .select('id, status, created_at')
            .eq('professional_id', user.id),
          
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('professional_id', user.id),
          
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('professional_id', user.id)
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          
          supabase
            .from('team_members')
            .select('id')
            .eq('professional_id', user.id)
            .eq('active', true)
        ]);

        // Process appointments
        const appointmentsResult = results[0];
        let appointments: any[] = [];
        if (appointmentsResult.status === 'fulfilled' && !appointmentsResult.value.error) {
          appointments = appointmentsResult.value.data || [];
        } else {
          console.warn("Failed to fetch appointments:", appointmentsResult);
        }

        // Process client counts
        const clientCountResult = results[1];
        let clientCount = 0;
        if (clientCountResult.status === 'fulfilled' && !clientCountResult.value.error) {
          clientCount = clientCountResult.value.count || 0;
        }

        const newClientsResult = results[2];
        let newClientsCount = 0;
        if (newClientsResult.status === 'fulfilled' && !newClientsResult.value.error) {
          newClientsCount = newClientsResult.value.count || 0;
        }

        // Process team members
        const teamMembersResult = results[3];
        let teamMembers: any[] = [];
        if (teamMembersResult.status === 'fulfilled' && !teamMembersResult.value.error) {
          teamMembers = teamMembersResult.value.data || [];
        }

        // Count appointments by status
        const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
        const completedCount = appointments.filter(a => a.status === 'completed').length;
        const canceledCount = appointments.filter(a => a.status === 'canceled').length;
        
        // Update stats
        setStats({
          totalAppointments: appointments.length,
          scheduledAppointments: scheduledCount,
          completedAppointments: completedCount,
          canceledAppointments: canceledCount,
          totalClients: clientCount,
          newClientsThisMonth: newClientsCount,
          teamMembers: teamMembers.length
        });

        console.log("Dashboard stats updated successfully");
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError("Erro ao carregar dados do painel. Tente novamente.");
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
    return <EnhancedLoading type="page" message="Carregando seu painel..." />;
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

  if (error) {
    return (
      <DashboardLayout title="Visão Geral">
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Erro ao Carregar</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-primary text-white py-2 px-4 rounded"
              >
                Tentar Novamente
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <ErrorBoundary>
      <DashboardLayout title="Visão Geral">
        <div className="space-y-6">
          {isLoading ? (
            <EnhancedLoading type="dashboard" />
          ) : (
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
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Novos este mês</span>
                      <div className="font-medium">{stats.newClientsThisMonth}</div>
                    </div>
                  </div>
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
                  <div className="text-2xl font-bold">{stats.teamMembers}</div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profissionais ativos</span>
                      <div className="font-medium">{stats.teamMembers}</div>
                    </div>
                  </div>
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
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Dashboard;
