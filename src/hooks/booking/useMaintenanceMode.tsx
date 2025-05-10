
import { useState } from 'react';
import { useLocalStorage } from '../useLocalStorage';

// Create a hook to manage maintenance mode
export const useMaintenanceMode = () => {
  // Use localStorage to persist maintenance mode state
  const [maintenanceMode, setStoredMaintenanceMode] = useLocalStorage('maintenance_mode', false);
  
  // Function to safely set maintenance mode
  const setMaintenanceMode = (enabled: boolean) => {
    console.log(`Setting maintenance mode to: ${enabled}`);
    setStoredMaintenanceMode(enabled);
  };
  
  return {
    maintenanceMode,
    setMaintenanceMode
  };
};
