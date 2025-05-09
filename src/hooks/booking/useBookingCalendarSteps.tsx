
import { useState } from 'react';

export const useBookingCalendarSteps = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedInsurance, setSelectedInsurance] = useState<string>("none");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleTeamMemberChange = (value: string) => {
    console.log("Team member selected:", value);
    setSelectedTeamMember(value);
    setSelectedService("");
    setSelectedInsurance("none");
    setSelectedDate(null);
    setCurrentStep(2); // Go to Insurance step first
  };
  
  const handleInsuranceChange = (value: string) => {
    console.log("Insurance selected:", value);
    setSelectedInsurance(value);
    setCurrentStep(3); // Now go to Service step
  };
  
  const handleServiceChange = (value: string) => {
    console.log("Service selected:", value);
    setSelectedService(value);
    setCurrentStep(4); // Then go to Date step
  };
  
  const handleDateSelect = (date: Date) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setCurrentStep(5); // Finally, go to Time step
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return {
    currentStep,
    selectedTeamMember,
    selectedService,
    selectedInsurance,
    selectedDate,
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateSelect,
    goToPreviousStep
  };
};
