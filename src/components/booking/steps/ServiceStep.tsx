
import React from 'react';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface ServiceStepProps {
  services: Service[];
  selectedService: string;
  onServiceChange: (value: string) => void;
  insuranceId?: string;
  isLoading?: boolean;
}

export const ServiceStep: React.FC<ServiceStepProps> = ({
  services,
  selectedService,
  onServiceChange,
  insuranceId,
  isLoading = false
}) => {
  // Filter services based on insurance if needed
  const availableServices = services.filter(service => {
    // If no insurance is selected or insurance is 'none', show all services
    if (!insuranceId || insuranceId === 'none') return true;
    
    // Add logic here to filter services based on insurance coverage
    // For now, return all services
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Selecione o serviço
      </h2>
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          {availableServices.map((service) => (
            <Button
              key={service.id}
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedService === service.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => onServiceChange(service.id)}
              disabled={isLoading}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{service.name}</span>
                {service.description && (
                  <span className="text-sm text-muted-foreground mt-1">{service.description}</span>
                )}
                {service.duration && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Duração: {service.duration} minutos
                  </span>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
          
          {availableServices.length === 0 && (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">Não há serviços disponíveis para o convênio selecionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
