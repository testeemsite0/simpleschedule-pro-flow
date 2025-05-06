
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';

interface InsurancePlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: InsurancePlan | null;
  onSuccess: () => void;
  userId: string;
}

export const InsurancePlanForm: React.FC<InsurancePlanFormProps> = ({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  onSuccess,
  userId 
}) => {
  const { toast } = useToast();
  const [planName, setPlanName] = useState('');
  const [planLimit, setPlanLimit] = useState<number | ''>('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (selectedPlan) {
      setPlanName(selectedPlan.name);
      setPlanLimit(selectedPlan.limit_per_plan || '');
      setIsEditing(true);
    } else {
      setPlanName('');
      setPlanLimit('');
      setIsEditing(false);
    }
  }, [selectedPlan]);

  const handleSave = async () => {
    if (!planName.trim() || !userId) return;
    
    try {
      // Convert planLimit to a number or null
      const limitValue = planLimit === '' ? null : Number(planLimit);
      
      if (isEditing && selectedPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('insurance_plans')
          .update({ 
            name: planName.trim(),
            limit_per_plan: limitValue
          })
          .eq('id', selectedPlan.id);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Convênio atualizado com sucesso',
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('insurance_plans')
          .insert([{
            name: planName.trim(),
            professional_id: userId,
            limit_per_plan: limitValue
          }]);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Convênio adicionado com sucesso',
        });
      }
      
      // Reset and close dialog
      setPlanName('');
      setPlanLimit('');
      onClose();
      
      // Refresh data
      onSuccess();
    } catch (error) {
      console.error('Error saving insurance plan:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o convênio',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Convênio' : 'Adicionar Novo Convênio'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Convênio</Label>
            <Input
              id="name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Ex: Unimed, Bradesco Saúde, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limit">Limite de Agendamentos</Label>
            <Input
              id="limit"
              type="number"
              value={planLimit}
              onChange={(e) => setPlanLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="Deixe em branco para ilimitado"
              min="1"
            />
            <p className="text-sm text-muted-foreground">
              Número máximo de agendamentos permitidos para este convênio. Deixe em branco para não impor limite.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? 'Atualizar' : 'Adicionar'} Convênio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
