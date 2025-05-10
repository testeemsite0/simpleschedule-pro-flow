
import { useState, useCallback } from 'react';

export const useSequentialLoading = (initialStage = 0, maxStages = 3) => {
  const [loadingStage, setLoadingStage] = useState<number>(initialStage);
  
  // Progress to next loading stage
  const moveToNextLoadingStage = useCallback(() => {
    setLoadingStage(prev => Math.min(prev + 1, maxStages)); // Max maxStages stages (0-maxStages-1)
  }, [maxStages]);
  
  // Reset to initial stage
  const resetLoadingStage = useCallback(() => {
    setLoadingStage(initialStage);
  }, [initialStage]);
  
  return {
    loadingStage,
    setLoadingStage,
    moveToNextLoadingStage,
    resetLoadingStage,
    isLastStage: loadingStage === maxStages - 1,
    isInitialStage: loadingStage === initialStage
  };
};
