
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemConfig {
  id: string;
  premium_price: number;
  stripe_price_id: string;
}

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const { data, error } = await (supabase
          .from('system_config' as any)
          .select('*')
          .single() as any);
          
        if (error) throw error;
        setConfig(data as SystemConfig);
      } catch (error) {
        console.error('Error fetching system config:', error);
      }
    };
    
    fetchSystemConfig();
  }, []);
  
  const handleCheckout = async (plan: string) => {
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
        body: { plan }
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
            {/* Plano Gratuito */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold">Plano Gratuito</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">R$0</span>
                  <span className="ml-1 text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Até 5 agendamentos/mês</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>1 profissional</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Notificações por email</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Pagamentos online</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" disabled>Atual</Button>
              </div>
            </div>
            
            {/* Plano Profissional */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold">Popular</div>
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold">Plano Profissional</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">{config ? formatPrice(config.premium_price) : 'R$99'}</span>
                  <span className="ml-1 text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Até 5 profissionais</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Notificações por email e SMS</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Pagamentos online</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => handleCheckout('professional')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Começar agora'}
                </Button>
              </div>
            </div>
            
            {/* Plano Empresarial */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold">Plano Empresarial</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">R$199</span>
                  <span className="ml-1 text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Profissionais ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Notificações por email, SMS e WhatsApp</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Pagamentos online</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => handleCheckout('enterprise')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Começar agora'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Pricing;
