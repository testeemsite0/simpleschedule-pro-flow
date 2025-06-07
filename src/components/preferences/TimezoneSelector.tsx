
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BRAZILIAN_TIMEZONES, BrazilianTimezone } from '@/utils/dynamicTimezone';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  disabled?: boolean;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  label = "Fuso Horário",
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o fuso horário" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(BRAZILIAN_TIMEZONES).map(([timezone, description]) => (
            <SelectItem key={timezone} value={timezone}>
              {description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
