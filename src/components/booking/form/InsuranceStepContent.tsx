
import React from 'react';
import { InsurancePlanStep } from '../InsurancePlanStep';

interface InsuranceStepContentProps {
  availableInsurancePlans: any[];
  insurancePlanId: string | undefined;
  onInsurancePlanChange: (value: string) => void;
  insuranceLimitError: string | null;
  teamMemberId: string | undefined;
}

export const InsuranceStepContent: React.FC<InsuranceStepContentProps> = ({
  availableInsurancePlans,
  insurancePlanId,
  onInsurancePlanChange,
  insuranceLimitError,
  teamMemberId
}) => {
  return (
    <InsurancePlanStep 
      availableInsurancePlans={availableInsurancePlans}
      insurancePlanId={insurancePlanId}
      onInsurancePlanChange={onInsurancePlanChange}
      insuranceLimitError={insuranceLimitError}
      teamMemberId={teamMemberId}
    />
  );
};
