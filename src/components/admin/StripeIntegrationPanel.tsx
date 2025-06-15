
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestTube, Save, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff, Copy } from 'lucide-react';
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
  const [stripeKeys, setStripeKeys] = useState({
    secretKey: '',
    publishableKey: ''
  });
  const [showKeys, setShowKeys] = useState({
    secret: false,
    publishable: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
    fetchStripeKeys();
  }, []);

  const fetchConfig = async () => {
    try {
      console.log('StripeIntegrationPanel: Fetching Stripe config...');
      
      const { data, error } = await supabase
        .from('stripe_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('StripeIntegrationPanel: Error fetching config:', error);
        throw error;
      }

      if (data) {
        console.log('StripeIntegrationPanel: Config loaded successfully');
        setConfig(data);
      }
    } catch (error) {
      console.error('StripeIntegrationPanel: Error in fetchConfig:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeKeys = async () => {
    try {
      console.log('StripeIntegrationPanel: Fetching Stripe keys...');
      
      // Buscar a chave secreta mascarada
      const { data: secretData, error: secretError } = await supabase.functions.invoke('get-stripe-secret', {
        body: { action: 'get' }
      });

      if (secretError) {
        console.error('StripeIntegrationPanel: Error fetching secret key:', secretError);
      } else if (secretData?.key) {
        setStripeKeys(prev => ({ ...prev, secretKey: secretData.key }));
      }

      // A chave pública pode ser armazenada no frontend (não é secreta)
      setStripeKeys(prev => ({ 
        ...prev, 
        publishableKey: 'pk_test_...' // Placeholder - deve ser configurada
      }));
      
      console.log('StripeIntegrationPanel: Keys fetched');
    } catch (error) {
      console.error('StripeIntegrationPanel: Error fetching keys:', error);
    }
  };

  const saveConfig = async () => {
    try {
      console.log('StripeIntegrationPanel: Saving config...');
      
      const { error } = await supabase
        .from('stripe_config')
        .upsert(config, { onConflict: 'id' });

      if (error) {
        console.error('StripeIntegrationPanel: Error saving config:', error);
        throw error;
      }

      console.log('StripeIntegrationPanel: Config saved successfully');
      toast({
        title: 'Sucesso',
        description: 'Configuração do Stripe salva com sucesso',
      });
    } catch (error) {
      console.error('StripeIntegrationPanel: Error in saveConfig:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const testStripeConnection = async () => {
    setTesting(true);
    try {
      console.log('StripeIntegrationPanel: Testing Stripe connection...');
      
      const { data, error } = await supabase.functions.invoke('test-stripe-connection');
      
      if (error) {
        console.error('StripeIntegrationPanel: Connection test error:', error);
        throw error;
      }
      
      if (data?.success) {
        setConnectionStatus('connected');
        toast({
          title: 'Sucesso',
          description: 'Conexão com Stripe estabelecida com sucesso',
        });
        console.log('StripeIntegrationPanel: Connection test successful');
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Erro',
          description: data?.error || 'Erro ao conectar com Stripe',
          variant: 'destructive',
        });
        console.log('StripeIntegrationPanel: Connection test failed:', data?.error);
      }
    } catch (error) {
      console.error('StripeIntegrationPanel: Error in testStripeConnection:', error);
      setConnectionStatus('error');
      toast({
        title: 'Erro',
        description: 'Erro ao testar conexão: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${type} copiada para a área de transferência`,
    });
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

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">Chaves de API</TabsTrigger>
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API do Stripe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="secret_key">Chave Secreta (Secret Key)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="secret_key"
                        type={showKeys.secret ? "text" : "password"}
                        value={stripeKeys.secretKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKeys(prev => ({ ...prev, secret: !prev.secret }))}
                      >
                        {showKeys.secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(stripeKeys.secretKey, 'Chave secreta')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurada nas variáveis de ambiente do servidor
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="publishable_key">Chave Pública (Publishable Key)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="publishable_key"
                        type={showKeys.publishable ? "text" : "password"}
                        value={stripeKeys.publishableKey}
                        onChange={(e) => setStripeKeys(prev => ({ ...prev, publishableKey: e.target.value }))}
                        className="font-mono text-sm"
                        placeholder="pk_test_..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKeys(prev => ({ ...prev, publishable: !prev.publishable }))}
                      >
                        {showKeys.publishable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(stripeKeys.publishableKey, 'Chave pública')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Usada no frontend para processar pagamentos
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">⚠️ Configuração de Chaves</h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Chave Secreta:</strong> Deve ser configurada nas variáveis de ambiente do servidor por segurança.
                    </p>
                    <p>
                      <strong>Chave Pública:</strong> Pode ser armazenada no frontend e é segura para exposição pública.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-white p-2 rounded border flex-1">
                    {window.location.origin}/api/stripe-webhook
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${window.location.origin}/api/stripe-webhook`, 'URL do webhook')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure esta URL no painel do Stripe para receber webhooks
                </p>
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
