import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionHistory, Subscriber } from '@/types';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  payment_history?: PaymentRecord[];
  future_appointments?: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: 'paid' | 'pending';
}

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [cancellationInProgress, setCancellationInProgress] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [activeTab, setActiveTab] = useState('current');
  
  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);
  
  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch current subscription status
      const { data: subscriptionCheck, error } = await supabase.functions.invoke('check-subscription', {
        method: 'POST',
        body: {},
      });
      
      if (error) throw error;
      
      // Simulate payment history - in a real app, this would come from the database
      // In a real implementation, this would come from Stripe
      const mockPaymentHistory = subscriptionCheck.subscribed ? [
        {
          id: 'pay_123456',
          date: new Date().toISOString(),
          amount: 4990, // in cents
          period_start: new Date().toISOString(),
          period_end: subscriptionCheck.subscription_end,
          status: 'paid' as const,
        }
      ] : [];
      
      // Count future appointments that would be affected by cancellation
      const endDate = subscriptionCheck.subscription_end ? parseISO(subscriptionCheck.subscription_end) : null;
      let futureAppointments = 0;
      
      if (endDate && subscriptionCheck.subscribed) {
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: false })
          .eq('professional_id', user.id)
          .eq('status', 'scheduled')
          .gte('date', endDate.toISOString().split('T')[0]);
          
        futureAppointments = count || 0;
      }
      
      setSubscription({
        ...subscriptionCheck,
        payment_history: mockPaymentHistory,
        future_appointments: futureAppointments,
      });
      
      // Fetch subscription history
      const { data: historyData, error: historyError } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (historyData) {
        setSubscriptionHistory(historyData as SubscriptionHistory[]);
      }
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da assinatura.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!user) return;
    
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura? Você poderá continuar usando o plano Premium até o fim do período atual.')) {
      return;
    }
    
    setCancellationInProgress(true);
    
    try {
      // Create a customer portal session for subscription management
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        method: 'POST',
        body: {},
      });
      
      if (error) throw error;
      
      // Redirect to the customer portal to complete cancellation
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Não foi possível obter o link para o portal do cliente');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a assinatura. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setCancellationInProgress(false);
    }
  };
  
  if (loading) {
    return <div className="p-4">Carregando informações de assinatura...</div>;
  }
  
  if (!subscription) {
    return <div className="p-4">Nenhuma informação de assinatura disponível</div>;
  }
  
  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100); // Convert cents to reais
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Assinatura Atual</TabsTrigger>
          <TabsTrigger value="history">Histórico de Assinaturas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Status da Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plano atual</p>
                    <p className="text-lg font-medium">
                      {subscription.subscribed ? 'Premium' : 'Gratuito'}
                      {subscription.subscribed && (
                        <span className="ml-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          Ativo
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {subscription.subscribed && (
                    <Button 
                      variant="outline" 
                      onClick={handleCancelSubscription}
                      disabled={cancellationInProgress}
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      {cancellationInProgress ? 'Processando...' : 'Cancelar Assinatura'}
                    </Button>
                  )}
                </div>
                
                {subscription.subscribed && subscription.subscription_end && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p>
                      {format(parseISO(subscription.subscription_end), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
                
                {subscription.subscribed && subscription.future_appointments > 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Agendamentos futuros</AlertTitle>
                    <AlertDescription>
                      Você tem {subscription.future_appointments} agendamento(s) para datas após o término atual da sua assinatura. 
                      Se você não renovar sua assinatura, esses agendamentos serão automaticamente cancelados.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {subscription.subscribed && subscription.payment_history && subscription.payment_history.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscription.payment_history.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(parseISO(payment.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          {format(parseISO(payment.period_start), 'dd/MM/yyyy', { locale: ptBR })} a{' '}
                          {format(parseISO(payment.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionHistory.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum registro de assinatura encontrado.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plano</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Cancelado em</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.subscription_tier}</TableCell>
                        <TableCell>
                          {format(parseISO(record.period_start), 'dd/MM/yyyy', { locale: ptBR })} a{' '}
                          {format(parseISO(record.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{formatCurrency(record.amount)}</TableCell>
                        <TableCell>
                          {record.cancellation_date 
                            ? format(parseISO(record.cancellation_date), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : record.status === 'canceled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status === 'active' 
                              ? 'Ativo' 
                              : record.status === 'canceled' 
                                ? 'Cancelado' 
                                : 'Expirado'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;
