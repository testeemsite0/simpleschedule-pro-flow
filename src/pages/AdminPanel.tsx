
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// System Statistics Component
const SystemStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [usersResponse, subscriptionsResponse, appointmentsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscribers').select('id', { count: 'exact' }).eq('subscribed', true),
        supabase.from('appointments').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResponse.count || 0,
        activeSubscriptions: subscriptionsResponse.count || 0,
        totalAppointments: appointmentsResponse.count || 0,
        monthlyRevenue: 0 // This would need proper calculation based on subscription data
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAppointments}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          subscribers(subscription_tier, subscribed)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Role do usuário atualizada',
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar role do usuário',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Visualize e gerencie todos os usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.user_roles?.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.user_roles?.role || 'professional'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.subscribers?.subscribed ? 'default' : 'outline'}>
                    {user.subscribers?.subscription_tier || 'free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.user_roles?.role || 'professional'}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// System Configuration Component
const SystemConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    premiumPrice: '39.90',
    stripePriceId: '',
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();

      if (error && !error.message.includes('PGRST116')) {
        console.error('Error fetching system config:', error);
        return;
      }

      if (data) {
        setConfig({
          premiumPrice: data.premium_price?.toString() || '39.90',
          stripePriceId: data.stripe_price_id || '',
          maintenanceMode: false // This would come from a maintenance table
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          premium_price: parseFloat(config.premiumPrice),
          stripe_price_id: config.stripePriceId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configuração do sistema atualizada',
      });
    } catch (error) {
      console.error('Error updating system config:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a configuração',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>
          Configure os parâmetros globais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="premiumPrice">Preço do Plano Premium (R$)</Label>
          <Input
            id="premiumPrice"
            type="number"
            step="0.01"
            min="0"
            value={config.premiumPrice}
            onChange={(e) => setConfig(prev => ({ ...prev, premiumPrice: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripePriceId">ID do Preço no Stripe</Label>
          <Input
            id="stripePriceId"
            value={config.stripePriceId}
            onChange={(e) => setConfig(prev => ({ ...prev, stripePriceId: e.target.value }))}
            placeholder="price_xxx"
          />
          <p className="text-sm text-muted-foreground">
            O ID do preço configurado no painel do Stripe para cobranças automáticas
          </p>
        </div>

        <Button 
          onClick={handleUpdateConfig} 
          disabled={loading} 
          className="mt-4"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Admin Panel Component
const AdminPanel = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (error && !error.message.includes('PGRST116')) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    verifyAdminAccess();
  }, [user]);
  
  if (loading) {
    return (
      <DashboardLayout title="Painel Administrativo">
        <p className="text-center py-8">Verificando permissões...</p>
      </DashboardLayout>
    );
  }
  
  if (!isAdmin) {
    return (
      <DashboardLayout title="Acesso Negado">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Você não tem permissão para acessar esta área.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Painel Administrativo">
      <SystemStats />
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="config">
          <SystemConfig />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminPanel;
