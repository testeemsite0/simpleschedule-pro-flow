
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RoleErrorHandlerProps {
  error: string | null;
  onRetry: () => void;
  loading?: boolean;
}

export const RoleErrorHandler: React.FC<RoleErrorHandlerProps> = ({
  error,
  onRetry,
  loading = false
}) => {
  if (!error) return null;

  const isRLSError = error.includes('policy') || 
                     error.includes('recursion') || 
                     error.includes('configuração');

  return (
    <Alert variant={isRLSError ? "default" : "destructive"} className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isRLSError ? 'Modo Limitado Ativo' : 'Erro de Permissões'}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Tentando...' : 'Tentar novamente'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
