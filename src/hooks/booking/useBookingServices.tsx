
import { Service, InsurancePlan } from '@/types';

interface UseBookingServicesProps {
  services: Service[];
  insurancePlans: InsurancePlan[];
}

export const useBookingServices = ({
  services,
  insurancePlans
}: UseBookingServicesProps) => {
  // Filter available services for a team member
  const getAvailableServicesForTeamMember = (teamMemberId: string) => {
    // In a more complex implementation, this would filter services based on team member skills/availability
    // For now, return all services
    return services.filter(() => true);
  };
  
  // Check if insurance limit reached
  const checkInsuranceLimitReached = (insuranceId: string) => {
    const insurance = insurancePlans.find(plan => plan.id === insuranceId);
    if (!insurance || !insurance.limit_per_plan) return false;
    return insurance.current_appointments >= insurance.limit_per_plan;
  };

  return {
    getAvailableServicesForTeamMember,
    checkInsuranceLimitReached
  };
};
