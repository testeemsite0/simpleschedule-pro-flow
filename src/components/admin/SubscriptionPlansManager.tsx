import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubscriptionPlan } from '@/types/admin';
import { useSystemFeatures } from "@/hooks/useSystemFeatures";
import { PlanFeaturesSelector } from "./PlanFeaturesSelector";

const SubscriptionPlansManager = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      // Transform the data to match our interface
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
        title: 'Erro',
        description: 'Erro ao carregar planos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { features: availableFeatures, loading: loadingFeatures } = useSystemFeatures();

  // Função para buscar features atreladas a um plano, retorna array de IDs.
  const getPlanFeatureIds = async (planId: string) => {
    const { data, error } = await supabase
      .from("subscription_plan_features")
      .select("feature_id")
      .eq("subscription_plan_id", planId);
    if (error) return [];
    return (data || []).map((row) => row.feature_id);
  };

  const PlanForm = ({
    plan,
    onSave,
    onCancel,
  }: {
    plan?: SubscriptionPlan;
    onSave: (plan: Partial<SubscriptionPlan>, featureIds: string[]) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      currency: plan?.currency || "BRL",
      stripe_price_id: plan?.stripe_price_id || "",
      interval_type: plan?.interval_type || "month",
      // features removido
      max_appointments: plan?.max_appointments ?? -1,
      max_team_members: plan?.max_team_members ?? -1,
      is_active: plan?.is_active ?? true,
      display_order: plan?.display_order || 0,
    });

    // Features controlado por IDs de features.
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
    const [initLoading, setInitLoading] = useState(true);

    useEffect(() => {
      async function loadFeaturesForEdit() {
        if (plan?.id) {
          setInitLoading(true);
          const ids = await getPlanFeatureIds(plan.id);
          setSelectedFeatureIds(ids);
          setInitLoading(false);
        } else {
          setSelectedFeatureIds([]);
          setInitLoading(false);
        }
      }
      loadFeaturesForEdit();
      // Apenas se o formulário abrir (plan?.id mudar)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plan?.id]);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
            <Input
              id="stripe_price_id"
              value={formData.stripe_price_id}
              onChange={(e) => setFormData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
              placeholder="price_xxxxx"
            />
          </div>
          <div>
            <Label htmlFor="interval_type">Intervalo</Label>
            <Select
              value={formData.interval_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, interval_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max_appointments">Máx. Agendamentos (-1 = ilimitado)</Label>
            <Input
              id="max_appointments"
              type="number"
              value={formData.max_appointments}
              onChange={(e) => setFormData(prev => ({ ...prev, max_appointments: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="max_team_members">Máx. Membros Equipe (-1 = ilimitado)</Label>
            <Input
              id="max_team_members"
              type="number"
              value={formData.max_team_members}
              onChange={(e) => setFormData(prev => ({ ...prev, max_team_members: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        {/* Substituir campo antigo de recursos do plano */}
        <div className="space-y-2">
          <Label>Funcionalidades Liberadas no Plano</Label>
          <PlanFeaturesSelector
            features={availableFeatures}
            selectedFeatureIds={selectedFeatureIds}
            onChange={setSelectedFeatureIds}
            loading={loadingFeatures || initLoading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Plano Ativo</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData, selectedFeatureIds)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    );
  };

  // Ajustar handleSavePlan para processar os features marcados
  const handleSavePlan = async (
    planData: Partial<SubscriptionPlan>,
    selectedFeatureIds: string[]
  ) => {
    try {
      const dataToSave = {
        name: planData.name || "",
        description: planData.description || null,
        price: planData.price || 0,
        currency: planData.currency || "BRL",
        stripe_price_id: planData.stripe_price_id || null,
        interval_type: planData.interval_type || "month",
        // features removido
        max_appointments: planData.max_appointments ?? null,
        max_team_members: planData.max_team_members ?? null,
        is_active: planData.is_active ?? true,
        display_order: planData.display_order || 0,
      };

      let planId: string;
      if (editingPlan?.id) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(dataToSave)
          .eq("id", editingPlan.id);
        if (error) throw error;
        planId = editingPlan.id;
        toast({ title: "Sucesso", description: "Plano atualizado com sucesso" });
      } else {
        const { data, error } = await supabase
          .from("subscription_plans")
          .insert(dataToSave)
          .select("id")
          .single();
        if (error || !data?.id) throw error || new Error("Falha ao criar plano");
        planId = data.id;
        toast({ title: "Sucesso", description: "Plano criado com sucesso" });
      }

      // Gerenciar features associadas ao plano
      // Remove todas as antigas e insere novas
      await supabase
        .from("subscription_plan_features")
        .delete()
        .eq("subscription_plan_id", planId);

      if (selectedFeatureIds.length > 0) {
        await supabase.from("subscription_plan_features").insert(
          selectedFeatureIds.map((featureId) => ({
            subscription_plan_id: planId,
            feature_id: featureId,
          }))
        );
      }

      fetchPlans();
      setIsDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano",
        variant: "destructive",
      });
    }
  };

  // Para exibição das features no Card
  const [featuresMap, setFeaturesMap] = useState<{ [id: string]: string }>({});
  useEffect(() => {
    // Carregar features para exibir label rapidamente
    if (availableFeatures.length > 0) {
      const map: { [id: string]: string } = {};
      availableFeatures.forEach((f) => (map[f.id] = f.label));
      setFeaturesMap(map);
    }
  }, [availableFeatures]);

  const [planFeaturesCache, setPlanFeaturesCache] = useState<{
    [planId: string]: string[];
  }>({});

  const fetchPlanFeatures = async (planId: string) => {
    const { data } = await supabase
      .from("subscription_plan_features")
      .select("feature_id")
      .eq("subscription_plan_id", planId);
    return (data || []).map((row) => row.feature_id);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso",
      });
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano",
        variant: "destructive",
      });
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
              onSave={handleSavePlan}
              onCancel={() => { setIsDialogOpen(false); setEditingPlan(null); }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
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
                      onClick={() => { setEditingPlan(plan); setIsDialogOpen(true); }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePlan(plan.id)}
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
                  <PlanFeaturesList planId={plan.id} featuresMap={featuresMap} fetchPlanFeatures={fetchPlanFeatures} />
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para exibir as features associadas ao plano
const PlanFeaturesList = ({
  planId,
  featuresMap,
  fetchPlanFeatures,
}: {
  planId: string;
  featuresMap: { [id: string]: string };
  fetchPlanFeatures: (planId: string) => Promise<string[]>;
}) => {
  const [featureIds, setFeatureIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fetchPlanFeatures(planId).then((ids) => {
      if (isMounted) {
        setFeatureIds(ids);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [planId, fetchPlanFeatures]);

  if (loading) return <span className="text-xs text-muted-foreground">Carregando...</span>;

  if (!featureIds.length) return <span className="text-xs text-muted-foreground">Nenhuma funcionalidade configurada</span>;

  return (
    <ul className="list-disc pl-5">
      {featureIds.map((fid) => (
        <li key={fid} className="text-sm">
          {featuresMap[fid] || '???'}
        </li>
      ))}
    </ul>
  );
};

export default SubscriptionPlansManager;
