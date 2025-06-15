
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { SubscriptionPlan } from '@/types/admin';
import { useSystemFeatures } from "@/hooks/useSystemFeatures";
import { PlanFeaturesSelector } from "./PlanFeaturesSelector";

interface PlanFormProps {
  plan?: SubscriptionPlan;
  onSave: (plan: Partial<SubscriptionPlan>, featureIds: string[]) => void;
  onCancel: () => void;
  getPlanFeatureIds: (planId: string) => Promise<string[]>;
}

export function PlanForm({ plan, onSave, onCancel, getPlanFeatureIds }: PlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    currency: plan?.currency || "BRL",
    stripe_price_id: plan?.stripe_price_id || "",
    interval_type: plan?.interval_type || "month",
    max_appointments: plan?.max_appointments ?? -1,
    max_team_members: plan?.max_team_members ?? -1,
    is_active: plan?.is_active ?? true,
    display_order: plan?.display_order || 0,
  });

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const { features: availableFeatures, loading: loadingFeatures } = useSystemFeatures();

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
  }, [plan?.id, getPlanFeatureIds]);

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
}
