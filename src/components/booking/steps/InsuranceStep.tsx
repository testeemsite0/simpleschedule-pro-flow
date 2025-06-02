
import React from 'react';
import { InsurancePlan } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface InsuranceStepProps {
  insurancePlans: InsurancePlan[];
  selectedInsurance: string;
  onInsuranceChange: (insuranceId: string) => void;
  teamMemberId?: string;
  checkInsuranceLimitReached?: (insuranceId: string, teamMemberId?: string) => boolean;
  isLoading?: boolean;
  onBack?: () => void;
}

export const InsuranceStep: React.FC<InsuranceStepProps> = ({
  insurancePlans,
  selectedInsurance,
  onInsuranceChange,
  teamMemberId,
  checkInsuranceLimitReached,
  isLoading = false,
  onBack
}) => {
  const handleInsuranceChange = (value: string) => {
    if (checkInsuranceLimitReached && teamMemberId) {
      const isLimitReached = checkInsuranceLimitReached(value, teamMemberId);
      if (isLimitReached) {
        console.warn("Insurance limit reached for this team member");
      }
    }
    onInsuranceChange(value);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Selecione seu convênio
      </h2>
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          {/* Particular option */}
          <Button
            variant="outline"
            className={`flex justify-between items-center p-4 h-auto ${selectedInsurance === 'none' ? "border-primary bg-primary/5" : ""}`}
            onClick={() => handleInsuranceChange('none')}
            disabled={isLoading}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Particular (sem convênio)</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Insurance plans */}
          {insurancePlans.map((plan) => (
            <Button
              key={plan.id}
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedInsurance === plan.id ? "border-primary bg-primary/5" : ""} ${plan.availableForBooking === false ? "opacity-50" : ""}`}
              onClick={() => handleInsuranceChange(plan.id)}
              disabled={isLoading || (plan.availableForBooking === false)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{plan.name}</span>
                {plan.availableForBooking === false && (
                  <span className="text-xs text-red-500 mt-1">
                    Limite de atendimentos atingido
                  </span>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
          
          {insurancePlans.length === 0 && (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">Não há convênios disponíveis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
