
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
          description: "Erro ao carregar planos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [toast]);
  
  const handleCheckout = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      toast({
        title: "Processando",
        description: "Estamos preparando sua compra..."
      });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro no checkout",
        description: "Ocorreu um erro ao processar seu pedido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      dynamicFeatures.push(`Até ${plan.max_appointments} agendamentos/mês`);
    }
    
    if (plan.max_team_members === -1) {
      dynamicFeatures.push('Profissionais ilimitados');
    } else if (plan.max_team_members > 0) {
      dynamicFeatures.push(`Até ${plan.max_team_members} profissionais`);
    }
    
    return [...dynamicFeatures, ...baseFeatures];
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="py-12 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center">
              <p>Carregando planos...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Planos e Preços</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Todos os planos incluem suporte e atualizações gratuitas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  index === 1 ? 'border-2 border-primary relative' : ''
                }`}
              >
                {index === 1 && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold">
                    Popular
                  </div>
                )}
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold">
                      {plan.price > 0 ? formatPrice(plan.price) : 'Gratuito'}
                    </span>
                    {plan.price > 0 && (
                      <span className="ml-1 text-gray-500">
                        /{plan.interval_type === 'month' ? 'mês' : 'ano'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {plan.description && (
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                  )}
                  <ul className="space-y-3 mb-6">
                    {formatFeatures(plan).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading || plan.price === 0}
                  >
                    {isLoading ? 'Processando...' : plan.price === 0 ? 'Gratuito' : 'Começar agora'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Pricing;
