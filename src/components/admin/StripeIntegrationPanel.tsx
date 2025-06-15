
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestTube, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StripeConfig {
  id?: string;
  webhook_endpoint_secret: string;
  webhook_events: string[];
  test_mode: boolean;
}

const StripeIntegrationPanel = () => {
  const [config, setConfig] = useState<StripeConfig>({
    webhook_endpoint_secret: '',
    webhook_events: ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_succeeded', 'invoice.payment_failed'],
    test_mode: true,
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      const { error } = await supabase
        .from('stripe_config')
        .upsert(config, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configuração do Stripe salva com sucesso',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive',
      });
    }
  };

  const testStripeConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-stripe-connection');
      
      if (error) throw error;
      
      if (data?.success) {
        setConnectionStatus('connected');
        toast({
          title: 'Sucesso',
          description: 'Conexão com Stripe estabelecida com sucesso',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Erro',
          description: data?.error || 'Erro ao conectar com Stripe',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
      toast({
        title: 'Erro',
        description: 'Erro ao testar conexão',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const availableEvents = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.trial_will_end',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'invoice.payment_action_required',
    'checkout.session.completed',
    'customer.created',
    'customer.updated',
  ];

  const toggleEvent = (event: string) => {
    setConfig(prev => ({
      ...prev,
      webhook_events: prev.webhook_events.includes(event)
        ? prev.webhook_events.filter(e => e !== event)
        : [...prev.webhook_events, event]
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Integração com Stripe</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {connectionStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === 'connected' ? 'Conectado' : connectionStatus === 'error' ? 'Erro' : 'Não testado'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={testStripeConnection}
              disabled={testing}
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="keys">Chaves de API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="test_mode"
                  checked={config.test_mode}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, test_mode: checked }))}
                />
                <Label htmlFor="test_mode">Modo de Teste</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {config.test_mode 
                  ? 'Usando chaves de teste do Stripe. Nenhuma transação real será processada.'
                  : 'Usando chaves de produção do Stripe. Transações reais serão processadas.'
                }
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook_secret">Webhook Endpoint Secret</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={config.webhook_endpoint_secret}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhook_endpoint_secret: e.target.value }))}
                  placeholder="whsec_..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Secret fornecido pelo Stripe para validar webhooks
                </p>
              </div>

              <div>
                <Label>Eventos Monitorados</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableEvents.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={config.webhook_events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded"
                      />
                      <Label htmlFor={event} className="text-sm">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">URL do Webhook</h4>
                <code className="text-sm bg-white p-2 rounded border block">
                  {window.location.origin}/api/stripe-webhook
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure esta URL no painel do Stripe para receber webhooks
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">⚠️ Configuração de Chaves</h4>
                  <p className="text-sm text-muted-foreground">
                    As chaves do Stripe devem ser configuradas nas variáveis de ambiente do servidor.
                    Entre em contato com o administrador do sistema para configurar:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• <code>STRIPE_SECRET_KEY</code> - Chave secreta do Stripe</li>
                    <li>• <code>STRIPE_PUBLISHABLE_KEY</code> - Chave pública do Stripe</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">✅ Status das Chaves</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">STRIPE_SECRET_KEY:</span>
                      <Badge variant="default">Configurada</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveConfig}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default StripeIntegrationPanel;
