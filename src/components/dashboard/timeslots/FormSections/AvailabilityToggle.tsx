
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AvailabilityToggleProps {
  available: boolean;
  setAvailable: (value: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  available,
  setAvailable
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="available"
        checked={available}
        onCheckedChange={setAvailable}
      />
      <Label htmlFor="available">Disponível para agendamento</Label>
    </div>
  );
};

export default AvailabilityToggle;
