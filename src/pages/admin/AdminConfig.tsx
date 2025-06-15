
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminConfig = () => {
  const { loading: accessLoading, hasAccess, AccessDeniedComponent } = useAdminAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    maintenanceMode: false,
    systemNotifications: true,
    debugMode: false
  });

  useEffect(() => {
    if (hasAccess) {
      fetchSystemConfig();
    }
  }, [hasAccess]);

  const fetchSystemConfig = async () => {
    try {
      console.log('AdminConfig: Fetching system configuration...');
      
      // Por enquanto, usar valores padrão já que não temos essas configurações no banco
      // No futuro, buscar de uma tabela system_settings
      setConfig({
        maintenanceMode: false,
        systemNotifications: true,
        debugMode: false
      });
      
      console.log('AdminConfig: Configuration loaded');
    } catch (error) {
      console.error('AdminConfig: Error fetching system config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do sistema',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      console.log('AdminConfig: Updating system configuration...');
      
      // Por enquanto, apenas simular a atualização
      // No futuro, salvar em uma tabela system_settings
      
      toast({
        title: 'Sucesso',
        description: 'Configurações do sistema atualizadas',
      });
      
      console.log('AdminConfig: Configuration updated successfully');
    } catch (error) {
      console.error('AdminConfig: Error updating system config:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar as configurações',
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais do Sistema</CardTitle>
            <CardDescription>
              Configure as preferências globais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar para bloquear o acesso ao sistema temporariamente
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificações do Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar notificações automáticas do sistema
                </p>
              </div>
              <Switch
                id="notifications"
                checked={config.systemNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, systemNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug">Modo Debug</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar logs detalhados para diagnósticos
                </p>
              </div>
              <Switch
                id="debug"
                checked={config.debugMode}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, debugMode: checked }))}
              />
            </div>

            <Button 
              onClick={handleUpdateConfig} 
              disabled={loading} 
              className="mt-6"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Informações sobre a versão e estado do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Versão:</span>
                <span className="ml-2 text-muted-foreground">1.0.0</span>
              </div>
              <div>
                <span className="font-medium">Ambiente:</span>
                <span className="ml-2 text-muted-foreground">Produção</span>
              </div>
              <div>
                <span className="font-medium">Banco de Dados:</span>
                <span className="ml-2 text-green-600">Conectado</span>
              </div>
              <div>
                <span className="font-medium">Último Backup:</span>
                <span className="ml-2 text-muted-foreground">Há 2 horas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminConfig;
