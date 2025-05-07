
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface TeamMemberErrorStateProps {
  error: string;
  onGoBack: () => void;
}

const TeamMemberErrorState: React.FC<TeamMemberErrorStateProps> = ({ error, onGoBack }) => {
  return (
    <>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error || 'Membro da equipe não encontrado'}
        </AlertDescription>
      </Alert>
      <div className="mt-4">
        <Button variant="outline" onClick={onGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Horários
        </Button>
      </div>
    </>
  );
};

export default TeamMemberErrorState;
