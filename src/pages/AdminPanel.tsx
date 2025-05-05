
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Admin Panel - System configuration tab
const SystemConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState<string>('39.90');
  const [stripePriceId, setStripePriceId] = useState<string>('');
  const [stripeKey, setStripeKey] = useState<string>('');
  const [stripeKeyMasked, setStripeKeyMasked] = useState<boolean>(true);
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching system config:', error);
        return;
      }

      if (data) {
        setPremiumPrice(data.premium_price.toString());
        setStripePriceId(data.stripe_price_id);
        setConfigId(data.id);
        
        // Fetch Stripe key from Supabase edge function secrets
        const { data: secretData, error: secretError } = await supabase.functions.invoke('get-stripe-secret', {
          body: { action: 'get' },
        });
        
        if (!secretError && secretData?.key) {
          // Mask the key for security
          setStripeKey(secretData.key);
          const maskedKey = secretData.key.substring(0, 8) + '...' + secretData.key.substring(secretData.key.length - 4);
          setStripeKey(maskedKey);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Save price configuration to database
      const { error } = await supabase
        .from('system_config')
        .update({
          premium_price: parseFloat(premiumPrice),
          stripe_price_id: stripePriceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', configId);

      if (error) throw error;

      // If Stripe key is changed and doesn't show asterisks, update it
      if (stripeKey && !stripeKey.includes('...')) {
        // Update stripe key via edge function
        const { error: keyError } = await supabase.functions.invoke('update-stripe-secret', {
          body: { key: stripeKey },
        });
        
        if (keyError) throw keyError;
      }

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
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripePriceId">ID do Preço no Stripe</Label>
          <Input
            id="stripePriceId"
            value={stripePriceId}
            onChange={(e) => setStripePriceId(e.target.value)}
            placeholder="price_xxx"
          />
          <p className="text-sm text-muted-foreground">
            O ID do preço configurado no painel do Stripe para cobranças automáticas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripeKey">Chave Secreta do Stripe</Label>
          <div className="flex gap-2">
            <Input
              id="stripeKey"
              type={stripeKeyMasked ? "password" : "text"}
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_xxx"
            />
            <Button
              variant="outline"
              onClick={() => setStripeKeyMasked(!stripeKeyMasked)}
              type="button"
            >
              {stripeKeyMasked ? "Mostrar" : "Esconder"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            A chave secreta do Stripe usada para processar pagamentos
          </p>
        </div>

        <Button 
          onClick={handleUpdate} 
          disabled={loading} 
          className="mt-4"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Admin Panel - Dashboard tab with statistics
const DashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ free: 0, premium: 0 });
  const [appointmentStats, setAppointmentStats] = useState({ client: 0, manual: 0 });
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    try {
      // Fetch user subscription stats
      const { data: userData, error: userError } = await supabase
        .from('subscribers')
        .select('subscription_tier, count')
        .group('subscription_tier');
      
      if (userError) throw userError;
      
      const free = userData?.find(item => item.subscription_tier === 'free')?.count || 0;
      const premium = userData?.find(item => item.subscription_tier === 'premium')?.count || 0;
      setUserStats({ free, premium });
      
      // Fetch appointment source stats
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('source, count')
        .group('source');
      
      if (appointmentError) throw appointmentError;
      
      const client = appointmentData?.find(item => item.source === 'client')?.count || 0;
      const manual = appointmentData?.find(item => item.source === 'manual')?.count || 0;
      setAppointmentStats({ client, manual });
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const subscriptionData = [
    { name: 'Plano Gratuito', value: userStats.free },
    { name: 'Plano Premium', value: userStats.premium },
  ];
  
  const appointmentData = [
    { name: 'Agendamento Cliente', value: appointmentStats.client },
    { name: 'Agendamento Manual', value: appointmentStats.manual },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Administrativo</CardTitle>
        <CardDescription>
          Visão geral dos dados do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8">Carregando estatísticas...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4 text-center">Distribuição de Usuários</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} usuários`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Plano</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Plano Gratuito</TableCell>
                      <TableCell className="text-right">{userStats.free}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plano Premium</TableCell>
                      <TableCell className="text-right">{userStats.premium}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-right font-medium">{userStats.free + userStats.premium}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4 text-center">Agendamentos por Origem</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appointmentData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Agendamento Cliente</TableCell>
                      <TableCell className="text-right">{appointmentStats.client}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Agendamento Manual</TableCell>
                      <TableCell className="text-right">{appointmentStats.manual}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-right font-medium">
                        {appointmentStats.client + appointmentStats.manual}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
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
    checkAdminAccess();
  }, [user]);
  
  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    try {
      // Check if user has admin role
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      // For this example, check if user's email is from the domain or a specific admin email
      // In a real app, you'd have a proper roles system
      setIsAdmin(data.email.includes('@admin.com') || data.email === 'admin@example.com');
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };
  
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
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="config">Configurações do Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DashboardStats />
        </TabsContent>
        
        <TabsContent value="config">
          <SystemConfig />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminPanel;
