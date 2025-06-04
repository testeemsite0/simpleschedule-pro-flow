
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LimitWarningProps {
  professionalId: string;
  isAdminView?: boolean;
}

export const LimitWarning: React.FC<LimitWarningProps> = ({
  professionalId,
  isAdminView = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdminView) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user, professionalId, isAdminView]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId: professionalId }
      });
      
      if (error) throw error;
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/dashboard/subscription');
  };

  if (loading || !isAdminView || !subscriptionData) {
    return null;
  }

  // Don't show warning if user is premium
  if (subscriptionData.isPremium) {
    return null;
  }

  // Show warning if at limit
  if (!subscriptionData.isWithinFreeLimit) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Limite de Agendamentos Atingido</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Você atingiu o limite de {subscriptionData.monthlyAppointments}/5 agendamentos mensais do plano gratuito.
            Faça upgrade para continuar criando agendamentos.
          </p>
          <Button onClick={handleUpgrade} size="sm" className="mt-2">
            <Crown className="mr-2 h-4 w-4" />
            Atualizar Plano
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning if near limit
  const isNearLimit = subscriptionData.monthlyAppointments >= 4;
  if (isNearLimit) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Próximo do Limite</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Você está usando {subscriptionData.monthlyAppointments}/5 agendamentos mensais.
            Considere fazer upgrade para agendamentos ilimitados.
          </p>
          <Button onClick={handleUpgrade} variant="outline" size="sm" className="mt-2">
            <Crown className="mr-2 h-4 w-4" />
            Ver Planos
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
