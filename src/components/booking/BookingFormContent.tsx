
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingAppointmentSummary } from './BookingAppointmentSummary';
import { InsurancePlanStep } from './InsurancePlanStep';
import { ClientInfoStep } from './ClientInfoStep';
import { TeamMember } from '@/types';

interface BookingFormContentProps {
  professionalName: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  selectedTeamMember?: TeamMember;
  currentStep: number;
  steps: { id: number; label: string }[];
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
  return (
    <>
      {/* Steps indicator */}
      <div className="sticky top-0 bg-white pb-4 z-10">
        <BookingStepIndicator 
          currentStep={currentStep} 
          steps={steps} 
        />
      </div>

      <BookingAppointmentSummary 
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
            <InsurancePlanStep 
              availableInsurancePlans={availableInsurancePlans}
              insurancePlanId={insurancePlanId}
              onInsurancePlanChange={onInsurancePlanChange}
              insuranceLimitError={insuranceLimitError}
              teamMemberId={teamMemberId}
            />
          )}
          
          {/* Step 2: Client information */}
          {currentStep === 2 && (
            <ClientInfoStep 
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
