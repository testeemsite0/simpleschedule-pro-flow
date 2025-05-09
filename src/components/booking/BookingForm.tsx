
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional } from '@/types';
import { useBookingForm } from '@/hooks/useBookingForm';
import { BookingFormContent } from './BookingFormContent';
import { BookingStepNavigator } from './FormSteps/BookingStepNavigator';

interface BookingFormProps {
  professional: Professional;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  onSuccess: (name: string, appointmentId: string) => void;
  onCancel: () => void;
  selectedTeamMember?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  professional,
  selectedDate,
  startTime,
  endTime,
  onSuccess,
  onCancel,
  selectedTeamMember
}) => {
  const {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    teamMemberId,
    insurancePlanId,
    isLoading,
    teamMembers,
    availableInsurancePlans,
    insuranceLimitError,
    currentStep,
    setCurrentStep,
    handleInsurancePlanChange,
    handleSubmit
  } = useBookingForm({
    professional,
    selectedDate,
    startTime,
    endTime,
    selectedTeamMember,
    onSuccess,
    onCancel
  });
  
  // Debug current form state
  console.log("BookingForm rendered with:", {
    currentStep,
    teamMemberId,
    insurancePlanId,
    selectedDate: selectedDate.toISOString(),
    startTime,
    endTime
  });
  
  // Booking steps - always start with cliente info (2)
  const steps = [
    { id: 1, label: 'Convênio' },
    { id: 2, label: 'Cliente' }
  ];
  
  const selectedTeamMemberObject = teamMembers.find(m => m.id === teamMemberId);
  
  const handleNext = () => {
    console.log("Moving to next form step: client info");
    handleInsurancePlanChange(insurancePlanId || "none");
  };
  
  const handlePrevious = () => {
    console.log("Moving to previous form step: insurance selection");
    setCurrentStep(1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete seu agendamento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <BookingFormContent 
            professionalName={professional.name}
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            selectedTeamMember={selectedTeamMemberObject}
            currentStep={currentStep}
            steps={steps}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            notes={notes}
            setNotes={setNotes}
            availableInsurancePlans={availableInsurancePlans}
            insurancePlanId={insurancePlanId}
            onInsurancePlanChange={handleInsurancePlanChange}
            insuranceLimitError={insuranceLimitError}
            teamMemberId={teamMemberId}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <BookingStepNavigator 
            currentStep={currentStep}
            isLoading={isLoading}
            insuranceLimitError={insuranceLimitError}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={onCancel}
            onSubmit={handleSubmit}
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
