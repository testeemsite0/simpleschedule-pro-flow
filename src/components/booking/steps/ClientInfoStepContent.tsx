
import React from 'react';
import { ClientInfoStep } from './ClientInfoStep';

interface ClientInfoStepContentProps {
  onClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  isLoading: boolean;
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
  defaultValues
}) => {
  return (
    <ClientInfoStep
      onClientInfoSubmit={onClientInfoSubmit}
      isLoading={isLoading}
      defaultValues={defaultValues}
      hideButtons={true} // Always hide buttons to prevent duplication
    />
  );
};
