
import React from 'react';
import { ClientInfoStep } from './ClientInfoStep';

interface ClientInfoStepContentProps {
  onClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const ClientInfoStepContent: React.FC<ClientInfoStepContentProps> = ({
  onClientInfoSubmit,
  isLoading,
  onBack
}) => {
  return (
    <ClientInfoStep
      onClientInfoSubmit={onClientInfoSubmit}
      isLoading={isLoading}
      onBack={onBack}
    />
  );
};
