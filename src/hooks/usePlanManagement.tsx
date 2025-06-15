
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/types/admin';

export function usePlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleSavePlan = async (
    planData: Partial<SubscriptionPlan>,
    selectedFeatureIds: string[],
    editingPlanId?: string
  ) => {
    try {
      const dataToSave = {
        name: planData.name || "",
        description: planData.description || null,
        price: planData.price || 0,
        currency: planData.currency || "BRL",
        stripe_price_id: planData.stripe_price_id || null,
        interval_type: planData.interval_type || "month",
        max_appointments: planData.max_appointments ?? null,
        max_team_members: planData.max_team_members ?? null,
        is_active: planData.is_active ?? true,
        display_order: planData.display_order || 0,
      };

      let planId: string;
      if (editingPlanId) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(dataToSave)
          .eq("id", editingPlanId);
        if (error) throw error;
        planId = editingPlanId;
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
      return true;
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano",
        variant: "destructive",
      });
      return false;
    }
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

  const getPlanFeatureIds = async (planId: string) => {
    const { data, error } = await supabase
      .from("subscription_plan_features")
      .select("feature_id")
      .eq("subscription_plan_id", planId);
    if (error) return [];
    return (data || []).map((row) => row.feature_id);
  };

  return {
    plans,
    loading,
    fetchPlans,
    handleSavePlan,
    handleDeletePlan,
    getPlanFeatureIds
  };
}
