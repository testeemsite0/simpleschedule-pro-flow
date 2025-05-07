
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BatchModeToggleProps {
  batchMode: boolean;
  setBatchMode: (value: boolean) => void;
}

const BatchModeToggle: React.FC<BatchModeToggleProps> = ({
  batchMode,
  setBatchMode
}) => {
  return (
    <div className="flex items-center space-x-2 pb-4 border-b">
      <Switch
        id="batchMode"
        checked={batchMode}
        onCheckedChange={setBatchMode}
      />
      <Label htmlFor="batchMode">Adicionar múltiplos horários</Label>
    </div>
  );
};

export default BatchModeToggle;
