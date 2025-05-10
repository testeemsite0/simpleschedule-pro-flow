
import { useState } from 'react';

export const useMaintenanceMode = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return {
    maintenanceMode,
    setMaintenanceMode
  };
};
