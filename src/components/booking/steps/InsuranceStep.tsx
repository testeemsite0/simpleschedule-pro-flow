
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { InsurancePlan } from '@/types';

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
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um convênio
      </h2>
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
          
          {insurancePlans.map(plan => (
            <Button
              key={plan.id}
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedInsurance === plan.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => onInsuranceChange(plan.id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{plan.name}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
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
