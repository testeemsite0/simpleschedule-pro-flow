
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

interface BusinessHoursWarningProps {
  message: string;
}

export const BusinessHoursWarning: React.FC<BusinessHoursWarningProps> = ({
  message
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        <strong>Horário indisponível:</strong>
        <br />
        {message}
      </AlertDescription>
    </Alert>
  );
};
