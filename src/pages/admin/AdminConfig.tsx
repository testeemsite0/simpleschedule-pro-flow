
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminConfig = () => {
  const { loading: accessLoading, hasAccess, AccessDeniedComponent } = useAdminAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    premiumPrice: '39.90',
    stripePriceId: '',
    maintenanceMode: false
  });

  useEffect(() => {
    if (hasAccess) {
      fetchSystemConfig();
    }
  }, [hasAccess]);

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
          maintenanceMode: false
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

  if (accessLoading) {
    return (
      <DashboardLayout title="Configurações do Sistema">
        <div className="flex items-center justify-center py-8">
          <p>Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  return (
    <DashboardLayout title="Configurações do Sistema">
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
    </DashboardLayout>
  );
};

export default AdminConfig;
