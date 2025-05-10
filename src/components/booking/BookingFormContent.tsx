
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepIndicatorWrapper } from './form/StepIndicatorWrapper';
import { BookingSummary } from './form/BookingSummary';
import { InsuranceStepContent } from './form/InsuranceStepContent';
import { ClientStepContent } from './form/ClientStepContent';
import { TeamMember } from '@/types';
import { BookingStep } from '@/hooks/booking/useBookingSteps';

interface BookingFormContentProps {
  professionalName: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: TeamMember;
  currentStep: BookingStep | number;
  steps: { id: number; key: string; label: string; }[];
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  availableInsurancePlans: any[];
  insurancePlanId: string | undefined;
  onInsurancePlanChange: (value: string) => void;
  insuranceLimitError: string | null;
  teamMemberId: string | undefined;
}

export const BookingFormContent: React.FC<BookingFormContentProps> = ({
  professionalName,
  selectedDate,
  startTime,
  endTime,
  selectedTeamMember,
  currentStep,
  steps,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  notes,
  setNotes,
  availableInsurancePlans,
  insurancePlanId,
  onInsurancePlanChange,
  insuranceLimitError,
  teamMemberId
}) => {
  // Convert number to BookingStep if needed
  const bookingStep = typeof currentStep === 'number' 
    ? (currentStep === 1 ? 'team-member' as BookingStep :
       currentStep === 2 ? 'insurance' as BookingStep :
       currentStep === 3 ? 'service' as BookingStep :
       currentStep === 4 ? 'date' as BookingStep :
       currentStep === 5 ? 'time' as BookingStep : 'team-member' as BookingStep)
    : currentStep;
    
  return (
    <>
      {/* Steps indicator */}
      <StepIndicatorWrapper 
        currentStep={bookingStep}
        steps={steps}
      />

      <BookingSummary 
        professionalName={professionalName}
        selectedDate={selectedDate}
        startTime={startTime}
        endTime={endTime}
        selectedTeamMember={selectedTeamMember}
      />
      
      <ScrollArea className="h-[350px]">
        <div className="space-y-6 pb-4 pr-4">
          {/* Step 1: Select Insurance */}
          {currentStep === 1 && (
            <InsuranceStepContent 
              availableInsurancePlans={availableInsurancePlans}
              insurancePlanId={insurancePlanId}
              onInsurancePlanChange={onInsurancePlanChange}
              insuranceLimitError={insuranceLimitError}
              teamMemberId={teamMemberId}
            />
          )}
          
          {/* Step 2: Client information */}
          {currentStep === 2 && (
            <ClientStepContent
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              notes={notes}
              setNotes={setNotes}
            />
          )}
        </div>
      </ScrollArea>
    </>
  );
};
