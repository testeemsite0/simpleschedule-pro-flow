
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface BookingErrorHandlerProps {
  error: string | Error | null;
  onRetry: () => void;
}

export const BookingErrorHandler: React.FC<BookingErrorHandlerProps> = ({
  error,
  onRetry
}) => {
  if (!error) return null;
  
  // Convert Error object to string if needed
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro no agendamento</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-2">
        <p>{errorMessage}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="w-fit"
        >
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};
