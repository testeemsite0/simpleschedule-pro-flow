
import { useState } from 'react';
import { toast } from 'sonner';

interface UseDataLoadingStateProps {
  initialLoading?: boolean;
  showToast?: boolean;
}

export const useDataLoadingState = ({ 
  initialLoading = true, 
  showToast = true 
}: UseDataLoadingStateProps = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const handleError = (errorMessage: string, errorObject?: any) => {
    console.error(`Error in data loading: ${errorMessage}`, errorObject);
    setDataError(errorMessage);
    
    if (showToast) {
      toast.error("Erro ao carregar dados para agendamento");
    }
    
    // Make sure loading is set to false to prevent UI from hanging
    setIsLoading(false);
  };
  
  const clearError = () => {
    setDataError(null);
  };
  
  return {
    isLoading,
    setIsLoading,
    dataError,
    setDataError,
    handleError,
    clearError
  };
};
