
import React from "react";
import { ErrorHandler } from "@/components/ui/error-handler";

interface BookingErrorHandlerProps {
  error: string | Error | null;
  resetError: () => void;
}

export const BookingErrorHandler: React.FC<BookingErrorHandlerProps> = ({
  error,
  resetError
}) => {
  if (!error) return null;
  
  // Convert Error object to string if needed
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <ErrorHandler
      error={errorMessage}
      resetError={resetError}
      title="Erro no agendamento"
    />
  );
};
