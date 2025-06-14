
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ConflictWarningProps {
  conflictDetails: {
    clientName: string;
    startTime: string;
    endTime: string;
  };
  onDismiss?: () => void;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({
  conflictDetails,
  onDismiss
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Conflito de horário detectado!</strong>
        <br />
        Já existe um agendamento com <strong>{conflictDetails.clientName}</strong> das{' '}
        <strong>{conflictDetails.startTime}</strong> às <strong>{conflictDetails.endTime}</strong>.
        <br />
        Por favor, escolha outro horário.
      </AlertDescription>
    </Alert>
  );
};
