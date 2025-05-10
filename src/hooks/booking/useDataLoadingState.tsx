
import { useState } from 'react';
import { toast } from 'sonner';

interface UseDataLoadingStateProps {
  initialLoading?: boolean;
}

export const useDataLoadingState = ({ initialLoading = true }: UseDataLoadingStateProps = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const handleError = (errorMessage: string) => {
    console.error(errorMessage);
    setDataError(errorMessage);
    toast.error("Erro ao carregar dados para agendamento");
  };
  
  return {
    isLoading,
    setIsLoading,
    dataError,
    setDataError,
    handleError
  };
};
