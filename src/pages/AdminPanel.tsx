
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Admin interface to represent the system configuration
interface SystemConfig {
  id: string;
  premium_price: number;
  stripe_price_id: string;
  updated_at: string;
}

// Interface for system statistics
interface SystemStats {
  total_users: number;
  free_users: number;
  premium_users: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
}

const ADMIN_EMAILS = ['admin@azulschedule.com']; // List of admin emails

const AdminPanel = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [premiumPrice, setPremiumPrice] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');

  useEffect(() => {
    // Check if the current user is an admin
    if (user && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      fetchSystemConfig();
      fetchSystemStats();
    }
    setLoading(false);
  }, [user]);

  const fetchSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setConfig(data);
        setPremiumPrice(data.premium_price.toString());
        setStripePriceId(data.stripe_price_id);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a configuração do sistema.',
        variant: 'destructive',
      });
    }
  };

  const fetchSystemStats = async () => {
    try {
      // In a real implementation, this would be a database query
      // For now, we'll simulate the stats
      setStats({
        total_users: 150,
        free_users: 120,
        premium_users: 30,
        active_subscriptions: 28,
        cancelled_subscriptions: 12,
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas do sistema.',
        variant: 'destructive',
      });
    }
  };

  const updateSystemConfig = async () => {
    try {
      const priceValue = parseFloat(premiumPrice);
      
      if (isNaN(priceValue)) {
        throw new Error('O preço deve ser um número válido');
      }
      
      const { error } = await supabase
        .from('system_config')
        .update({
          premium_price: priceValue,
          stripe_price_id: stripePriceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config?.id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Configuração do sistema atualizada com sucesso.',
      });
      
      fetchSystemConfig();
    } catch (error) {
      console.error('Error updating system config:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar a configuração do sistema.',
        variant: 'destructive',
      });
    }
  };

  // If not authenticated or loading, don't show anything yet
  if (!isAuthenticated || loading) {
    return <Navigate to="/login" />;
  }

  // If user is not an admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <DashboardLayout title="Painel Administrativo">
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo ao Painel Administrativo</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e visualize relatórios de uso.
          </p>
        </Card>

        <Tabs defaultValue="config">
          <TabsList>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Configurações do Plano Premium</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="premium-price">Valor do Plano Premium (R$)</Label>
                  <Input
                    id="premium-price"
                    type="number"
                    step="0.01"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    placeholder="Ex: 49.90"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stripe-price-id">Stripe Price ID</Label>
                  <Input
                    id="stripe-price-id"
                    value={stripePriceId}
                    onChange={(e) => setStripePriceId(e.target.value)}
                    placeholder="price_1AbCdEfGhIjKlMnOpQrStUvW"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    ID do preço no Stripe para o checkout do plano premium.
                  </p>
                </div>
                
                <Button onClick={updateSystemConfig}>Salvar Alterações</Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Relatórios do Sistema</h3>
              
              {stats ? (
                <Table>
                  <TableCaption>Estatísticas atualizadas em tempo real.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Métrica</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total de usuários cadastrados</TableCell>
                      <TableCell className="text-right">{stats.total_users}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Profissionais no plano gratuito</TableCell>
                      <TableCell className="text-right">{stats.free_users}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Profissionais no plano premium</TableCell>
                      <TableCell className="text-right">{stats.premium_users}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Assinaturas ativas</TableCell>
                      <TableCell className="text-right">{stats.active_subscriptions}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Assinaturas canceladas</TableCell>
                      <TableCell className="text-right">{stats.cancelled_subscriptions}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p>Carregando estatísticas...</p>
              )}
              
              <Button className="mt-4" onClick={fetchSystemStats}>
                Atualizar Estatísticas
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
