
import React from 'react';
import { InsuranceStep } from '../steps/InsuranceStep';
import { InsurancePlan } from '@/types';

interface InsuranceStepContentProps {
  insurancePlans: InsurancePlan[];
  selectedInsurance: string;
  onInsuranceChange: (insuranceId: string) => void;
  teamMemberId?: string;
  checkInsuranceLimitReached?: (insuranceId: string, teamMemberId?: string) => boolean;
}

export const InsuranceStepContent: React.FC<InsuranceStepContentProps> = ({
  insurancePlans,
  selectedInsurance,
  onInsuranceChange,
  teamMemberId,
  checkInsuranceLimitReached
}) => {
  return (
    <InsuranceStep
      insurancePlans={insurancePlans}
      selectedInsurance={selectedInsurance}
      onInsuranceChange={onInsuranceChange}
      teamMemberId={teamMemberId}
      checkInsuranceLimitReached={checkInsuranceLimitReached}
    />
  );
};
