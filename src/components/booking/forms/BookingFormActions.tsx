
import React from "react";
import { Button } from "@/components/ui/button";

interface BookingFormActionsProps {
  onBack?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  showBackButton?: boolean;
  submitLabel?: string;
  backLabel?: string;
}

export const BookingFormActions: React.FC<BookingFormActionsProps> = ({
  onBack,
  onSubmit,
  isLoading = false,
  showBackButton = true,
  submitLabel = "Finalizar Agendamento",
  backLabel = "Voltar"
}) => {
  return (
    <div className="flex justify-between mt-6">
      {showBackButton && onBack && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          {backLabel}
        </Button>
      )}
      {onSubmit && (
        <Button 
          type="submit"
          disabled={isLoading}
          className="ml-auto"
          onClick={onSubmit}
        >
          {isLoading ? "Agendando..." : submitLabel}
        </Button>
      )}
    </div>
  );
};
