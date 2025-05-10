
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface BookingErrorHandlerProps {
  error: string | Error | null;
  onRetry: () => void;
  title?: string; // Make title optional
}

export const BookingErrorHandler: React.FC<BookingErrorHandlerProps> = ({
  error,
  onRetry,
  title = "Erro no agendamento" // Set default value
}) => {
  if (!error) return null;
  
  // Convert Error object to string if needed
  const errorMessage = error instanceof Error ? error.message : error;
  
  console.log("BookingErrorHandler: Displaying error:", errorMessage);
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-2">
        <p>{errorMessage}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            console.log("BookingErrorHandler: Retry button clicked");
            onRetry();
          }}
          className="w-fit"
        >
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};
