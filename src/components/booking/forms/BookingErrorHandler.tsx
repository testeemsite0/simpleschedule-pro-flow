
import React from "react";
import { ErrorHandler } from "@/components/ui/error-handler";

interface BookingErrorHandlerProps {
  error: string | null;
  resetError: () => void;
}

export const BookingErrorHandler: React.FC<BookingErrorHandlerProps> = ({
  error,
  resetError
}) => {
  if (!error) return null;
  
  return (
    <ErrorHandler
      error={error}
      resetError={resetError}
      title="Erro no agendamento"
    />
  );
};
