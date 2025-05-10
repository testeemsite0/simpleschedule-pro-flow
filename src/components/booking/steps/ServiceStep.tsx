
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Service } from '@/types';

interface ServiceStepProps {
  services: Service[];
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  onBack: () => void;
  insuranceId?: string;
}

export const ServiceStep: React.FC<ServiceStepProps> = ({
  services,
  selectedService,
  onServiceChange,
  onBack,
  insuranceId = "none" // Default to "none" for private payment
}) => {
  // Function to display the price based on the type of insurance
  const renderPrice = (service: Service) => {
    console.log("ServiceStep rendering price with insuranceId:", insuranceId);
    
    // If it's private payment (none), show the normal price
    if (insuranceId === "none") {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(Number(service.price));
    }
    
    // If it's insurance, show "Valor conforme plano"
    return <span className="text-xs text-muted-foreground">Valor conforme plano</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um serviço
      </h2>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          {services.map(service => (
            <Button
              key={service.id}
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedService === service.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => onServiceChange(service.id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{service.name}</span>
                {renderPrice(service)}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
          
          {services.length === 0 && (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">Não há serviços disponíveis para este profissional.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
