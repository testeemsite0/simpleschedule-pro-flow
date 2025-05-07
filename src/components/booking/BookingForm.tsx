
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional, TeamMember } from '@/types';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingAppointmentSummary } from './BookingAppointmentSummary';
import { InsurancePlanStep } from './InsurancePlanStep';
import { ClientInfoStep } from './ClientInfoStep';
import { useBookingForm } from '@/hooks/useBookingForm';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Booking steps
  const steps = [
    { id: 1, label: 'Convênio' },
    { id: 2, label: 'Cliente' }
  ];
  
  const selectedTeamMemberObject = teamMembers.find(m => m.id === teamMemberId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete seu agendamento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Steps indicator */}
          <div className="sticky top-0 bg-white pb-4 z-10">
            <BookingStepIndicator 
              currentStep={currentStep} 
              steps={steps} 
            />
          </div>

          <BookingAppointmentSummary 
            professionalName={professional.name}
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            selectedTeamMember={selectedTeamMemberObject}
          />
          
          <ScrollArea className="h-[350px]">
            <div className="space-y-6 pb-4 pr-4">
              {/* Step 1: Select Insurance */}
              {currentStep === 1 && (
                <InsurancePlanStep 
                  availableInsurancePlans={availableInsurancePlans}
                  insurancePlanId={insurancePlanId}
                  onInsurancePlanChange={handleInsurancePlanChange}
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
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          {currentStep === 1 ? (
            <>
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
              >
                Voltar
              </Button>
              <Button 
                type="button" 
                onClick={() => handleInsurancePlanChange(insurancePlanId || "none")}
              >
                Próximo
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                disabled={
                  isLoading || 
                  !!insuranceLimitError
                }
              >
                {isLoading ? 'Enviando...' : 'Confirmar agendamento'}
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
