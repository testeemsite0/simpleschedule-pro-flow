
import React from 'react';
import { Service } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ServiceSelectionStepProps {
  services: Service[];
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  disabled?: boolean;
}

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({
  services,
  selectedService,
  onServiceChange,
  onBack,
  onContinue,
  disabled = false
}) => {
  if (services.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 border rounded-md border-yellow-200 bg-yellow-50">
          <p className="text-yellow-800">Não há serviços disponíveis para este profissional.</p>
        </div>
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Selecione o Serviço</h2>
      <ScrollArea className="h-[300px] pr-4">
        <RadioGroup value={selectedService} onValueChange={onServiceChange} className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-muted/30">
              <RadioGroupItem value={service.id} id={`service-${service.id}`} disabled={disabled} />
              <div className="grid gap-1.5 leading-none w-full">
                <Label htmlFor={`service-${service.id}`} className="text-base font-medium">
                  {service.name}
                </Label>
                {service.description && (
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm font-medium">
                    {service.duration_minutes} minutos
                  </p>
                  <p className="text-sm font-bold">
                    R$ {service.price?.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={disabled}>
          Voltar
        </Button>
        <Button onClick={onContinue} disabled={!selectedService || disabled}>
          Continuar
        </Button>
      </div>
    </div>
  );
};
