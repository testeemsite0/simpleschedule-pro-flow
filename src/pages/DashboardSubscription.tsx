
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Crown,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface SubscriptionData {
  isPremium: boolean;
  isWithinFreeLimit: boolean;
  monthlyAppointments: number;
  subscriptionEnd: string | null;
  subscription: any;
}

const DashboardSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching subscription data for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      console.log('Subscription data received:', data);
      setSubscriptionData(data);
      
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      setUpgrading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard/subscription`,
          cancelUrl: `${window.location.origin}/dashboard/subscription`,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao iniciar processo de upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      setManagingSubscription(true);
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          userId: user.id,
          returnUrl: `${window.location.origin}/dashboard/subscription`,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setManagingSubscription(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Meu Plano">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados da assinatura...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const usagePercentage = subscriptionData ? (subscriptionData.monthlyAppointments / 5) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = !subscriptionData?.isWithinFreeLimit;

  return (
    <DashboardLayout title="Meu Plano">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meu Plano</h1>
            <p className="text-muted-foreground">
              Gerencie sua assinatura e acompanhe o uso
            </p>
          </div>
          <Button onClick={fetchSubscriptionData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Current Plan Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscriptionData?.isPremium ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
                <CardTitle>
                  {subscriptionData?.isPremium ? 'Plano Premium' : 'Plano Gratuito'}
                </CardTitle>
              </div>
              <Badge variant={subscriptionData?.isPremium ? "default" : "secondary"}>
                {subscriptionData?.isPremium ? 'Ativo' : 'Gratuito'}
              </Badge>
            </div>
            <CardDescription>
              {subscriptionData?.isPremium 
                ? 'Você tem acesso a todos os recursos premium'
                : 'Você está no plano gratuito com recursos limitados'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionData?.isPremium ? (
              <div className="space-y-2">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Plano Premium Ativo</AlertTitle>
                  <AlertDescription>
                    Agendamentos ilimitados e acesso a todos os recursos.
                    {subscriptionData.subscriptionEnd && (
                      <p className="mt-1 text-sm">
                        Próxima renovação: {new Date(subscriptionData.subscriptionEnd).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                  className="w-full"
                >
                  {managingSubscription ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Gerenciar Assinatura
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isAtLimit && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Limite Atingido</AlertTitle>
                    <AlertDescription>
                      Você atingiu o limite de 5 agendamentos mensais do plano gratuito.
                      Faça upgrade para continuar agendando.
                    </AlertDescription>
                  </Alert>
                )}
                
                {isNearLimit && !isAtLimit && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Próximo do Limite</AlertTitle>
                    <AlertDescription>
                      Você está próximo do limite mensal. Considere fazer upgrade.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-accent/30 p-4 rounded-md space-y-3">
                  <h3 className="font-medium">Upgrade para Premium</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Agendamentos ilimitados</li>
                    <li>Relatórios avançados</li>
                    <li>Suporte prioritário</li>
                    <li>Funcionalidades exclusivas</li>
                  </ul>
                  <p className="font-medium text-lg">R$ 39,90 / mês</p>
                </div>

                <Button 
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full"
                >
                  {upgrading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" />
                  )}
                  Fazer Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        {!subscriptionData?.isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Uso Mensal
              </CardTitle>
              <CardDescription>
                Acompanhe seu uso do plano gratuito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Agendamentos este mês</span>
                  <span className="text-sm">
                    {subscriptionData?.monthlyAppointments || 0} / 5
                  </span>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit ? 'bg-red-500' : 
                      isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {isAtLimit 
                    ? 'Limite atingido. Faça upgrade para continuar.'
                    : `Você tem ${5 - (subscriptionData?.monthlyAppointments || 0)} agendamentos restantes este mês.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSubscription;
