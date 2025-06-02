
import React from 'react';
import { ServiceStep } from '../steps/ServiceStep';
import { Service } from '@/types';

interface ServiceStepContentProps {
  services: Service[];
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  getAvailableServicesForTeamMember: (teamMemberId: string) => Service[];
  teamMemberId: string;
  insuranceId?: string;
}

export const ServiceStepContent: React.FC<ServiceStepContentProps> = ({
  services,
  selectedService,
  onServiceChange,
  getAvailableServicesForTeamMember,
  teamMemberId,
  insuranceId
}) => {
  return (
    <ServiceStep
      services={getAvailableServicesForTeamMember(teamMemberId)}
      selectedService={selectedService}
      onServiceChange={onServiceChange}
      insuranceId={insuranceId}
    />
  );
};
