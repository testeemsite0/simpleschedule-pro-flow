
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface BookingStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };
  
  return (
    <div className={`flex justify-between mb-8 ${className}`}>
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
              <div className={`h-0.5 w-full ${currentStep > step.id ? "bg-primary" : "bg-muted"}`}></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
