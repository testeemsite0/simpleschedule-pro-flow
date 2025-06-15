
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, CreditCard, Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalAppointments: number;
  monthlyRevenue: number;
  growthData: Array<{ month: string; users: number; revenue: number; appointments: number }>;
  planDistribution: Array<{ name: string; value: number; color: string }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    growthData: [],
    planDistribution: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [usersResponse, subscriptionsResponse, appointmentsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscribers').select('id', { count: 'exact' }).eq('subscribed', true),
        supabase.from('appointments').select('id', { count: 'exact' })
      ]);

      // Fetch subscription distribution
      const { data: planDistribution } = await supabase.rpc('count_subscribers_by_tier');
      
      // Fetch monthly growth data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: monthlyData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Process monthly data
      const growthData = processMonthlyData(monthlyData || []);
      
      // Fetch recent appointments for activity
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('client_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const recentActivity = (recentAppointments || []).map(apt => ({
        type: 'appointment',
        description: `Novo agendamento: ${apt.client_name}`,
        timestamp: apt.created_at
      }));

      const planColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
      const formattedPlanDistribution = (planDistribution || []).map((item: any, index: number) => ({
        name: item.subscription_tier || 'Gratuito',
        value: parseInt(item.count),
        color: planColors[index % planColors.length]
      }));

      setStats({
        totalUsers: usersResponse.count || 0,
        activeSubscriptions: subscriptionsResponse.count || 0,
        totalAppointments: appointmentsResponse.count || 0,
        monthlyRevenue: 0, // This would need proper calculation
        growthData,
        planDistribution: formattedPlanDistribution,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[]) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const usersInMonth = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getFullYear() === date.getFullYear() && 
               itemDate.getMonth() === date.getMonth();
      }).length;

      last6Months.push({
        month: monthNames[date.getMonth()],
        users: usersInMonth,
        revenue: usersInMonth * 39.90, // Mock calculation
        appointments: usersInMonth * 12 // Mock calculation
      });
    }
    
    return last6Months;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +7.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(stats.activeSubscriptions * 39.90).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +25.4% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento nos Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="Usuários" />
                <Line type="monotone" dataKey="appointments" stroke="#82ca9d" name="Agendamentos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma atividade recente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
