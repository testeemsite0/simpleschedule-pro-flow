
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface SubscriptionProps {
  onSubscriptionUpdated?: () => void;
}

const SubscriptionManagement: React.FC<SubscriptionProps> = ({ 
  onSubscriptionUpdated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isPremium: boolean;
    isWithinFreeLimit: boolean;
    monthlyAppointments: number;
    subscriptionEnd: string | null;
    subscription: any;
  } | null>(null);
  const [premiumPrice, setPremiumPrice] = useState<number>(39.90);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
      fetchPremiumPrice();
    }
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      setSubscriptionStatus(data);
      
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o status da sua assinatura',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumPrice = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('premium_price')
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPremiumPrice(data.premium_price);
      }
    } catch (error) {
      console.error('Error fetching premium price:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      setCheckoutLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/pricing`,
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
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o processo de assinatura',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      setPortalLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          userId: user.id,
          returnUrl: `${window.location.origin}/dashboard`,
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
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal de gerenciamento da assinatura',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const refreshStatus = async () => {
    await fetchSubscriptionStatus();
    if (onSubscriptionUpdated) {
      onSubscriptionUpdated();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Assinatura</CardTitle>
        <CardDescription>
          Gerencie seu plano e veja o status atual
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscriptionStatus?.isPremium ? (
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Plano Premium Ativo</AlertTitle>
            <AlertDescription>
              Você tem acesso a todas as funcionalidades premium.
              {subscriptionStatus.subscriptionEnd && (
                <p className="text-sm mt-2">
                  Próxima cobrança: {new Date(subscriptionStatus.subscriptionEnd).toLocaleDateString('pt-BR')}
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Plano Gratuito</AlertTitle>
              <AlertDescription>
                Você está utilizando a versão gratuita com recursos limitados.
              </AlertDescription>
            </Alert>
            
            {!subscriptionStatus?.isWithinFreeLimit && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Limite de agendamentos atingido</AlertTitle>
                <AlertDescription>
                  Você atingiu o limite de 5 agendamentos mensais do plano gratuito.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-accent/30 p-4 rounded-md">
              <h3 className="font-medium mb-2">Plano Premium</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Agendamentos ilimitados</li>
                <li>Acesso a todos os recursos</li>
                <li>Relatórios avançados</li>
                <li>Suporte prioritário</li>
              </ul>
              <p className="mt-3 font-medium">
                R$ {premiumPrice.toFixed(2)} / mês
              </p>
            </div>
          </>
        )}
        
        <div className="pt-2">
          <p className="text-sm text-muted-foreground">
            Status atual: <span className="font-medium">{subscriptionStatus?.monthlyAppointments || 0}</span> agendamentos neste mês
            {!subscriptionStatus?.isPremium && (
              <span> (limite: 5 no plano gratuito)</span>
            )}
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        {subscriptionStatus?.isPremium ? (
          <Button 
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full"
          >
            {portalLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...</>
            ) : (
              'Gerenciar Assinatura'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className="w-full"
          >
            {checkoutLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...</>
            ) : (
              'Assinar Plano Premium'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionManagement;
