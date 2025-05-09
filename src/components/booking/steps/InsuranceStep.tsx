
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertCircle, Info } from 'lucide-react';
import { InsurancePlan } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsuranceStepProps {
  insurancePlans: InsurancePlan[];
  selectedInsurance: string;
  onInsuranceChange: (insuranceId: string) => void;
  onBack: () => void;
}

export const InsuranceStep: React.FC<InsuranceStepProps> = ({
  insurancePlans,
  selectedInsurance,
  onInsuranceChange,
  onBack
}) => {
  console.log("InsuranceStep props:", { insurancePlans, selectedInsurance });
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um convênio
      </h2>
      
      {insurancePlans.length === 0 && (
        <Alert variant="warning" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Não há convênios disponíveis. Continue com atendimento particular.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className={`flex justify-between items-center p-4 h-auto ${selectedInsurance === "none" ? "border-primary bg-primary/5" : ""}`}
            onClick={() => onInsuranceChange("none")}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Particular</span>
              <span className="text-xs text-muted-foreground">Pagamento direto</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          {insurancePlans.map(plan => {
            const isAvailable = plan.availableForBooking !== false;
            const hasLimit = plan.limit_per_plan !== null;
            const isLimitReached = hasLimit && plan.current_appointments >= plan.limit_per_plan;
            
            return (
              <Button
                key={plan.id}
                variant="outline"
                className={`flex justify-between items-center p-4 h-auto ${
                  selectedInsurance === plan.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => onInsuranceChange(plan.id)}
                disabled={isLimitReached}
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <span className="font-medium">{plan.name}</span>
                    {hasLimit && (
                      <Badge
                        variant={isLimitReached ? "destructive" : "secondary"}
                        className="ml-2"
                      >
                        {plan.current_appointments}/{plan.limit_per_plan}
                      </Badge>
                    )}
                  </div>
                  {isLimitReached && (
                    <span className="text-xs text-destructive mt-1">
                      Limite de agendamentos atingido
                    </span>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
