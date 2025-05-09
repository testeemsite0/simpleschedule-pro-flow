
import { BookingStep } from "@/hooks/booking/useBookingSteps";

interface Step {
  id: number;
  label: string;
}

export const getBookingSteps = (): Step[] => {
  return [
    { id: 1, label: "Profissional" },
    { id: 2, label: "Convênio" },
    { id: 3, label: "Serviço" },
    { id: 4, label: "Data" },
    { id: 5, label: "Horário" },
    { id: 6, label: "Cliente" },
  ];
};

export const getCurrentStepNumber = (currentStep: BookingStep): number => {
  switch (currentStep) {
    case "team-member": return 1;
    case "insurance": return 2;
    case "service": return 3;
    case "date": return 4;
    case "time": return 5;
    case "client-info": return 6;
    case "confirmation": return 7;
    default: return 1;
  }
};
