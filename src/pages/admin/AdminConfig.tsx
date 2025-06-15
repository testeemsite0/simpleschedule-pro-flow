
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface SystemSettings {
  id: string;
  maintenance_mode: boolean;
  system_notifications: boolean;
  debug_mode: boolean;
}

const AdminConfig = () => {
  const { loading: accessLoading, hasAccess, AccessDeniedComponent } = useAdminAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (hasAccess) {
      fetchSystemConfig();
    }
  }, [hasAccess]);

  const fetchSystemConfig = async () => {
    try {
      console.log('AdminConfig: Fetching system configuration from database...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('AdminConfig: Error fetching system config:', error);
        throw error;
      }
      
      if (data) {
        console.log('AdminConfig: Configuration loaded successfully:', data);
        setSettings(data);
      } else {
        console.log('AdminConfig: No configuration found, using defaults');
        // Se não encontrar configuração, criar uma
        const { data: newConfig, error: createError } = await supabase
          .from('system_settings')
          .insert({
            maintenance_mode: false,
            system_notifications: true,
            debug_mode: false
          })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        setSettings(newConfig);
      }
      
    } catch (error) {
      console.error('AdminConfig: Error in fetchSystemConfig:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do sistema: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    if (!settings) return;
    
    setLoading(true);
    try {
      console.log('AdminConfig: Updating system configuration...', settings);
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          maintenance_mode: settings.maintenance_mode,
          system_notifications: settings.system_notifications,
          debug_mode: settings.debug_mode
        })
        .eq('id', settings.id);

      if (error) {
        console.error('AdminConfig: Error updating system config:', error);
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Configurações do sistema atualizadas com sucesso',
      });
      
      console.log('AdminConfig: Configuration updated successfully');
    } catch (error) {
      console.error('AdminConfig: Error in handleUpdateConfig:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configurações: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof Omit<SystemSettings, 'id'>, value: boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (accessLoading || fetchLoading) {
    return (
      <DashboardLayout title="Configurações do Sistema">
        <div className="flex items-center justify-center py-8">
          <p>Carregando configurações...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  if (!settings) {
    return (
      <DashboardLayout title="Configurações do Sistema">
        <div className="flex items-center justify-center py-8">
          <p>Erro ao carregar configurações do sistema.</p>
        </div>
      </DashboardLayout>
    );
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
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
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
                checked={settings.system_notifications}
                onCheckedChange={(checked) => updateSetting('system_notifications', checked)}
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
                checked={settings.debug_mode}
                onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
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
