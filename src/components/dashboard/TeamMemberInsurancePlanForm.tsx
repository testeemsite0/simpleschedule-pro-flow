
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { TeamMember, InsurancePlan, TeamMemberInsurancePlan } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberInsurancePlanFormProps {
  teamMember: TeamMember;
  availableInsurancePlans: InsurancePlan[];
  onSave: (selectedPlans: {
    insurancePlanId: string;
    limitPerMember: number | null;
  }[]) => void;
  onCancel: () => void;
}

interface PlanSelection {
  insurancePlanId: string;
  selected: boolean;
  limitPerMember: number | null;
  currentAppointments?: number;
}

const TeamMemberInsurancePlanForm: React.FC<TeamMemberInsurancePlanFormProps> = ({
  teamMember,
  availableInsurancePlans,
  onSave,
  onCancel
}) => {
  const [selectedPlans, setSelectedPlans] = useState<PlanSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExistingPlans = async () => {
      try {
        setIsLoading(true);
        
        // Fetch existing plan associations
        const { data: existingPlanAssociations, error } = await supabase
          .from('team_member_insurance_plans')
          .select('*')
          .eq('team_member_id', teamMember.id);
          
        if (error) throw error;
        
        // Initialize plan selections
        const initialSelections: PlanSelection[] = availableInsurancePlans.map(plan => {
          const existingAssociation = existingPlanAssociations?.find(
            assoc => assoc.insurance_plan_id === plan.id
          );
          
          return {
            insurancePlanId: plan.id,
            selected: !!existingAssociation,
            limitPerMember: existingAssociation?.limit_per_member || null,
            currentAppointments: existingAssociation?.current_appointments || 0
          };
        });
        
        setSelectedPlans(initialSelections);
      } catch (error) {
        console.error('Error loading team member insurance plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (teamMember && availableInsurancePlans.length > 0) {
      loadExistingPlans();
    }
  }, [teamMember, availableInsurancePlans]);
  
  const handleCheckboxChange = (planId: string, checked: boolean) => {
    setSelectedPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.insurancePlanId === planId 
          ? { ...plan, selected: checked } 
          : plan
      )
    );
  };
  
  const handleLimitChange = (planId: string, value: string) => {
    const numericValue = value === '' ? null : parseInt(value, 10);
    
    setSelectedPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.insurancePlanId === planId 
          ? { ...plan, limitPerMember: numericValue } 
          : plan
      )
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const plansToSave = selectedPlans
      .filter(plan => plan.selected)
      .map(plan => ({
        insurancePlanId: plan.insurancePlanId,
        limitPerMember: plan.limitPerMember
      }));
      
    onSave(plansToSave);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Carregando convênios...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Selecione os convênios que este profissional pode atender e defina os limites de agendamento para cada convênio.
        </div>
        
        {selectedPlans.length === 0 ? (
          <div className="text-center py-4">
            Nenhum convênio disponível. Adicione convênios primeiro.
          </div>
        ) : (
          <div className="space-y-4">
            {selectedPlans.map((plan) => {
              const insurancePlan = availableInsurancePlans.find(
                p => p.id === plan.insurancePlanId
              );
              
              return (
                <Card key={plan.insurancePlanId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id={`plan-${plan.insurancePlanId}`}
                          checked={plan.selected}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(plan.insurancePlanId, checked as boolean)
                          }
                        />
                        <div>
                          <Label
                            htmlFor={`plan-${plan.insurancePlanId}`}
                            className="text-base font-medium cursor-pointer"
                          >
                            {insurancePlan?.name}
                          </Label>
                          
                          {plan.currentAppointments !== undefined && plan.currentAppointments > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Agendamentos atuais: {plan.currentAppointments}
                            </p>
                          )}
                          
                          {insurancePlan?.limit_per_plan && (
                            <p className="text-xs text-muted-foreground">
                              Limite global: {insurancePlan.limit_per_plan}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {plan.selected && (
                        <div className="w-32">
                          <Label 
                            htmlFor={`limit-${plan.insurancePlanId}`} 
                            className="text-xs block mb-1"
                          >
                            Limite individual
                          </Label>
                          <Input
                            id={`limit-${plan.insurancePlanId}`}
                            type="number"
                            min="1"
                            placeholder="Ilimitado"
                            value={plan.limitPerMember === null ? '' : plan.limitPerMember}
                            onChange={(e) => handleLimitChange(plan.insurancePlanId, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Convênios
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TeamMemberInsurancePlanForm;
