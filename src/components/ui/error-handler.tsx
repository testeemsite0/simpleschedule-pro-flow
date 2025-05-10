import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorHandlerProps {
  error: string | null;
  resetError?: () => void;
  retryAction?: () => void;
  title?: string;
}

export function ErrorHandler({
  error,
  resetError,
  retryAction,
  title = "Ocorreu um erro"
}: ErrorHandlerProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{error}</p>
        <div className="flex gap-2">
          {retryAction && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryAction}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </Button>
          )}
          {resetError && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetError}
            >
              Fechar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
