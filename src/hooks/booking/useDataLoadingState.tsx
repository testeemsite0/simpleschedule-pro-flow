
import { useState, useCallback } from 'react';
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
  
  // Use useCallback to prevent function recreation on each render
  const handleError = useCallback((errorMessage: string, errorObject?: any) => {
    console.error(`Error in data loading: ${errorMessage}`, errorObject);
    setDataError(errorMessage);
    
    if (showToast) {
      toast.error("Erro ao carregar dados para agendamento");
    }
    
    // Make sure loading is set to false to prevent UI from hanging
    setIsLoading(false);
  }, [showToast]);
  
  const clearError = useCallback(() => {
    if (dataError !== null) {
      setDataError(null);
    }
  }, [dataError]);
  
  return {
    isLoading,
    setIsLoading,
    dataError,
    setDataError,
    handleError,
    clearError
  };
};
