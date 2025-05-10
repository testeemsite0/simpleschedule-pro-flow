
import React from 'react';
import { ServiceStep } from '../steps/ServiceStep';
import { Service } from '@/types';

interface ServiceStepContentProps {
  services: Service[];
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  onBack: () => void;
  getAvailableServicesForTeamMember: (teamMemberId: string) => Service[];
  teamMemberId: string;
}

export const ServiceStepContent: React.FC<ServiceStepContentProps> = ({
  services,
  selectedService,
  onServiceChange,
  onBack,
  getAvailableServicesForTeamMember,
  teamMemberId
}) => {
  return (
    <ServiceStep
      services={getAvailableServicesForTeamMember(teamMemberId)}
      selectedService={selectedService}
      onServiceChange={onServiceChange}
      onBack={onBack}
    />
  );
};
