
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubscriptionPlan } from '@/types/admin';
import { useSystemFeatures } from "@/hooks/useSystemFeatures";
import { usePlanManagement } from '@/hooks/usePlanManagement';
import { PlanForm } from './PlanForm';
import { PlanCard } from './PlanCard';

const SubscriptionPlansManager = () => {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { features: availableFeatures } = useSystemFeatures();
  const { plans, loading, handleSavePlan, handleDeletePlan, getPlanFeatureIds } = usePlanManagement();

  // Para exibição das features no Card
  const [featuresMap, setFeaturesMap] = useState<{ [id: string]: string }>({});
  
  useEffect(() => {
    if (availableFeatures.length > 0) {
      const map: { [id: string]: string } = {};
      availableFeatures.forEach((f) => (map[f.id] = f.label));
      setFeaturesMap(map);
    }
  }, [availableFeatures]);

  const onSavePlan = async (planData: Partial<SubscriptionPlan>, selectedFeatureIds: string[]) => {
    const success = await handleSavePlan(planData, selectedFeatureIds, editingPlan?.id);
    if (success) {
      setIsDialogOpen(false);
      setEditingPlan(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando planos...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Planos de Assinatura</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPlan(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
            </DialogHeader>
            <PlanForm
              plan={editingPlan || undefined}
              onSave={onSavePlan}
              onCancel={() => { setIsDialogOpen(false); setEditingPlan(null); }}
              getPlanFeatureIds={getPlanFeatureIds}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featuresMap={featuresMap}
              onEdit={(plan) => { setEditingPlan(plan); setIsDialogOpen(true); }}
              onDelete={handleDeletePlan}
              fetchPlanFeatures={getPlanFeatureIds}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlansManager;
