
import React from 'react';
import { ClientInfoStep } from './ClientInfoStep';

interface ClientInfoStepContentProps {
  onClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  isLoading: boolean;
  onBack: () => void;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
}

export const ClientInfoStepContent: React.FC<ClientInfoStepContentProps> = ({
  onClientInfoSubmit,
  isLoading,
  onBack,
  defaultValues
}) => {
  return (
    <ClientInfoStep
      onClientInfoSubmit={onClientInfoSubmit}
      isLoading={isLoading}
      onBack={onBack}
      defaultValues={defaultValues}
      hideButtons={true} // Always hide buttons to prevent duplication
    />
  );
};
