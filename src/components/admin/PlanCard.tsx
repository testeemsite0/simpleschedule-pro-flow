
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { SubscriptionPlan } from '@/types/admin';
import { PlanFeaturesDisplay } from './PlanFeaturesDisplay';

interface PlanCardProps {
  plan: SubscriptionPlan;
  featuresMap: { [id: string]: string };
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => void;
  fetchPlanFeatures: (planId: string) => Promise<string[]>;
}

export function PlanCard({ plan, featuresMap, onEdit, onDelete, fetchPlanFeatures }: PlanCardProps) {
  return (
    <Card className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <p className="text-2xl font-bold text-green-600">
              {plan.price > 0 ? `R$ ${plan.price.toFixed(2)}` : 'Gratuito'}
              {plan.price > 0 && (
                <span className="text-sm text-muted-foreground">
                  /{plan.interval_type === 'month' ? 'mês' : 'ano'}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(plan)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(plan.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span>Agendamentos:</span>
            <span>{plan.max_appointments === -1 ? 'Ilimitado' : plan.max_appointments}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Membros da Equipe:</span>
            <span>{plan.max_team_members === -1 ? 'Ilimitado' : plan.max_team_members}</span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <strong className="block text-sm mb-1">Funcionalidades Liberadas:</strong>
          <PlanFeaturesDisplay 
            planId={plan.id} 
            featuresMap={featuresMap} 
            fetchPlanFeatures={fetchPlanFeatures} 
          />
        </div>

        {plan.stripe_price_id && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <strong>Stripe Price ID:</strong> {plan.stripe_price_id}
          </div>
        )}

        <div className="mt-3 flex justify-between items-center">
          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
            {plan.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Ordem: {plan.display_order}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
