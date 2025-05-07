
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface BreakSelectorProps {
  hasLunchBreak: boolean;
  setHasLunchBreak: (value: boolean) => void;
  lunchBreakStart: string;
  setLunchBreakStart: (value: string) => void;
  lunchBreakEnd: string;
  setLunchBreakEnd: (value: string) => void;
}

const BreakSelector: React.FC<BreakSelectorProps> = ({
  hasLunchBreak,
  setHasLunchBreak,
  lunchBreakStart,
  setLunchBreakStart,
  lunchBreakEnd,
  setLunchBreakEnd
}) => {
  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Switch
          id="hasLunchBreak"
          checked={hasLunchBreak}
          onCheckedChange={setHasLunchBreak}
        />
        <Label htmlFor="hasLunchBreak">Incluir intervalo de almoço</Label>
      </div>
      
      {hasLunchBreak && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="lunchBreakStart">Início do almoço</Label>
            <Input
              id="lunchBreakStart"
              type="time"
              value={lunchBreakStart}
              onChange={(e) => setLunchBreakStart(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lunchBreakEnd">Fim do almoço</Label>
            <Input
              id="lunchBreakEnd"
              type="time"
              value={lunchBreakEnd}
              onChange={(e) => setLunchBreakEnd(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakSelector;
