
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InsurancePlan } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InsurancePlanStepProps {
  availableInsurancePlans: InsurancePlan[];
  insurancePlanId?: string;
  onInsurancePlanChange: (value: string) => void;
  insuranceLimitError: string | null;
  teamMemberId?: string;
}

export const InsurancePlanStep: React.FC<InsurancePlanStepProps> = ({
  availableInsurancePlans,
  insurancePlanId,
  onInsurancePlanChange,
  insuranceLimitError,
  teamMemberId
}) => {
  // For debugging
  console.log("InsurancePlanStep props:", {
    availablePlans: availableInsurancePlans,
    insurancePlanId,
    teamMemberId
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tipo de atendimento</h2>
      
      <div className="space-y-2">
        <Label htmlFor="insurancePlan">Convênio</Label>
        <Select value={insurancePlanId} onValueChange={onInsurancePlanChange}>
          <SelectTrigger id="insurancePlan">
            <SelectValue placeholder="Particular" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              <SelectItem value="none">Particular</SelectItem>
              
              {availableInsurancePlans.length > 0 ? (
                availableInsurancePlans.map(plan => {
                  const isAvailable = plan.availableForBooking !== false;
                  const limitInfo = plan.memberLimit 
                    ? `${plan.memberCurrentAppointments}/${plan.memberLimit}`
                    : plan.limit_per_plan
                      ? `${plan.current_appointments}/${plan.limit_per_plan}`
                      : '';
                  
                  return (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      disabled={!isAvailable}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        {limitInfo && (
                          <Badge 
                            variant={isAvailable ? "secondary" : "destructive"}
                            className="ml-2"
                          >
                            {limitInfo}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {teamMemberId 
                    ? "Este profissional não tem convênios disponíveis" 
                    : "Nenhum convênio disponível"}
                </div>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
          
        {insuranceLimitError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite de convênio</AlertTitle>
            <AlertDescription>
              {insuranceLimitError}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
