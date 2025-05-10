
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingStepIndicatorProps {
  currentStep: BookingStep | number;
}

export const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({
  currentStep
}) => {
  const steps = [
    { id: 1, key: 'team-member', label: 'Profissional' },
    { id: 2, key: 'insurance', label: 'Convênio' },
    { id: 3, key: 'service', label: 'Serviço' },
    { id: 4, key: 'time', label: 'Horário' },
    { id: 5, key: 'client-info', label: 'Cliente' },
    { id: 6, key: 'confirmation', label: 'Confirmação' }
  ];

  const getCurrentStepIndex = () => {
    // Handle both BookingStep string and legacy number step
    if (typeof currentStep === 'number') {
      return currentStep;
    }
    
    const index = steps.findIndex(step => step.key === currentStep);
    return index >= 0 ? index + 1 : 1;
  };
  
  const getStepStatus = (stepId: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepId < currentIndex) return "completed";
    if (stepId === currentIndex) return "current";
    return "upcoming";
  };
  
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step) => (
        <React.Fragment key={step.id}>
          <div className={`flex flex-col items-center ${getStepStatus(step.id) === "completed" ? "text-primary" : getStepStatus(step.id) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              getStepStatus(step.id) === "completed" ? "bg-primary text-primary-foreground" : 
              getStepStatus(step.id) === "current" ? "border-2 border-primary text-primary" : 
              "border-2 border-muted text-muted-foreground"
            }`}>
              {getStepStatus(step.id) === "completed" ? <CheckCircle className="w-5 h-5" /> : step.id}
            </div>
            <span className="text-xs">{step.label}</span>
          </div>
          
          {step.id < steps.length && (
            <div className="flex-1 flex items-center mx-2">
              <div className={`h-0.5 w-full ${getCurrentStepIndex() > step.id ? "bg-primary" : "bg-muted"}`}></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
