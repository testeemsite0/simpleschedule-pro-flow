
import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Carregando horários disponíveis..." 
}) => {
  return (
    <div className="text-center py-8">
      <p>{message}</p>
    </div>
  );
};

interface LimitStateProps {
  message?: string;
}

export const LimitState: React.FC<LimitStateProps> = ({ 
  message = "Nenhuma vaga disponível para agendamento." 
}) => {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">
        {message}
      </p>
    </Card>
  );
};

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

interface NoTeamMembersStateProps {
  message?: string;
}

export const NoTeamMembersState: React.FC<NoTeamMembersStateProps> = ({
  message = "Nenhum profissional disponível para agendamento. Por favor, entre em contato conosco para mais informações."
}) => {
  return (
    <Alert variant="default" className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
      <Info className="h-4 w-4 text-amber-500" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};
