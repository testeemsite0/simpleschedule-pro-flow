
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stripe_price_id: string;
  interval_type: string;
  features: string[];
  max_appointments: number;
  max_team_members: number;
  is_active: boolean;
  display_order: number;
}

const AvailablePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
          
        if (error) throw error;
        
        const transformedPlans = (data || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : 
                   typeof plan.features === 'string' ? JSON.parse(plan.features) : 
                   []
        }));
        
        setPlans(transformedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar planos disponíveis",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar assinatura",
        variant: "destructive"
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatFeatures = (plan: SubscriptionPlan) => {
    const baseFeatures = plan.features || [];
    const dynamicFeatures = [];
    
    if (plan.max_appointments === -1) {
      dynamicFeatures.push('Agendamentos ilimitados');
    } else if (plan.max_appointments > 0) {
      dynamicFeatures.push(`${plan.max_appointments} agendamentos/mês`);
    }
    
    if (plan.max_team_members === -1) {
      dynamicFeatures.push('Membros ilimitados');
    } else if (plan.max_team_members > 0) {
      dynamicFeatures.push(`${plan.max_team_members} membros da equipe`);
    }
    
    return [...dynamicFeatures, ...baseFeatures];
  };

  if (loading) {
    return <div className="text-center py-8">Carregando planos disponíveis...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Planos Disponíveis</h3>
        <p className="text-sm text-muted-foreground">
          Escolha o plano que melhor atende às suas necessidades
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.display_order === 2 && (
                  <Badge variant="default">Popular</Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-primary">
                {plan.price > 0 ? formatPrice(plan.price) : 'Gratuito'}
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground font-normal">
                    /{plan.interval_type === 'month' ? 'mês' : 'ano'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {plan.description && (
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              )}
              
              <ul className="space-y-2 mb-6">
                {formatFeatures(plan).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPlan === plan.id || plan.price === 0}
              >
                {processingPlan === plan.id ? 'Processando...' : 
                 plan.price === 0 ? 'Plano Atual' : 'Assinar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailablePlans;
