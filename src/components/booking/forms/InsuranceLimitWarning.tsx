
import React from "react";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { InsurancePlan } from "@/types";

interface InsuranceLimitWarningProps {
  insurancePlans: InsurancePlan[];
}

export const InsuranceLimitWarning: React.FC<InsuranceLimitWarningProps> = ({
  insurancePlans
}) => {
  const plansWithLimits = insurancePlans.filter(plan => 
    plan.limit_per_plan && plan.current_appointments >= plan.limit_per_plan
  );
  
  if (plansWithLimits.length === 0) return null;
  
  return (
    <>
      {plansWithLimits.map(plan => (
        <div key={plan.id} className="mb-2">
          <StatusIndicator variant="limit">
            Limite atingido para o plano {plan.name}
          </StatusIndicator>
        </div>
      ))}
    </>
  );
};
