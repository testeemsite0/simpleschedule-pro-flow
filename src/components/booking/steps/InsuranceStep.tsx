
import React from 'react';
import { InsurancePlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface InsuranceStepProps {
  insurancePlans: InsurancePlan[];
  selectedInsurance: string;
  onInsuranceChange: (insuranceId: string) => void;
  teamMemberId?: string;
  checkInsuranceLimitReached?: (insuranceId: string, teamMemberId?: string) => boolean;
  isLoading?: boolean;
  onBack: () => void;
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
        // You can handle the limit reached case here if needed
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
      
      <RadioGroup value={selectedInsurance} onValueChange={handleInsuranceChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="insurance-none" />
            <Label htmlFor="insurance-none">Particular (sem convênio)</Label>
          </div>

          {insurancePlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 p-3">
                  <RadioGroupItem 
                    value={plan.id} 
                    id={`insurance-${plan.id}`} 
                    disabled={isLoading || (plan.availableForBooking === false)} 
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`insurance-${plan.id}`}
                      className={plan.availableForBooking === false ? "text-gray-400" : ""}
                    >
                      {plan.name}
                      {plan.availableForBooking === false && (
                        <span className="block text-xs text-red-500 mt-1">
                          Limite de atendimentos atingido
                        </span>
                      )}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>
      
      <div className="flex w-full justify-start">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
