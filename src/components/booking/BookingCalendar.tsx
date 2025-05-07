import React from 'react';
import { Card } from '@/components/ui/card';
import { TimeSlot, Appointment, Professional } from '@/types';
import { BookingStepIndicator } from './BookingStepIndicator';
import { ProfessionalStep } from './steps/ProfessionalStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { ServiceStep } from './steps/ServiceStep';
import { DateStep } from './steps/DateStep';
import { TimeStep } from './steps/TimeStep';
import { BookingSelectionSummary } from './BookingSelectionSummary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useBookingCalendar } from '@/hooks/useBookingCalendar';

interface BookingCalendarProps {
  professional: Professional;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  professional,
  timeSlots,
  appointments,
  onSelectSlot
}) => {
  const {
    selectedDate,
    availableDates,
    availableSlots,
    teamMembers,
    services,
    selectedTeamMember,
    selectedService,
    selectedInsurance,
    insurancePlans,
    isOverLimit,
    loading,
    currentStep,
    error,
    handleTeamMemberChange,
    handleServiceChange,
    handleInsuranceChange,
    handleDateSelect,
    goToPreviousStep,
  } = useBookingCalendar({
    professionalId: professional.id,
    timeSlots,
    appointments
  });
  
  // Define booking steps - Updated to include Service step
  const steps = [
    { id: 1, label: 'Profissional' },
    { id: 2, label: 'Serviço' },
    { id: 3, label: 'Convênio' },
    { id: 4, label: 'Data' },
    { id: 5, label: 'Horário' }
  ];
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    // Always pass the selectedTeamMember to ensure consistency
    console.log("Slot selected:", { date, startTime, endTime, teamMemberId: selectedTeamMember });
    onSelectSlot(date, startTime, endTime, selectedTeamMember);
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Carregando horários disponíveis...</p>
      </div>
    );
  }
  
  if (isOverLimit) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Nenhuma vaga disponível para agendamento.
        </p>
      </Card>
    );
  }

  // Filter services for selected team member
  const teamMemberServices = services.filter(service => {
    // If no team member is selected, show all services
    if (!selectedTeamMember) return true;
    // Otherwise, filter services that this team member can provide
    // This is a placeholder, as we don't have actual service-to-team-member mapping
    return true; // Replace with actual filtering logic
  });
  
  return (
    <div className="space-y-6">
      {/* Steps indicator with sticky positioning */}
      <div className="sticky top-0 bg-white pb-4 z-10">
        <BookingStepIndicator steps={steps} currentStep={currentStep} />
      </div>
      
      {/* Error message if any */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content area with fixed height and scrolling */}
      <div className="relative">
        <ScrollArea className="h-[400px] overflow-y-auto pr-4">
          <div className="space-y-6 pb-4">
            {/* Step 1: Select Professional */}
            {currentStep === 1 && (
              <ProfessionalStep 
                teamMembers={teamMembers}
                selectedTeamMember={selectedTeamMember}
                onTeamMemberChange={handleTeamMemberChange}
              />
            )}
            
            {/* Step 2: Select Service */}
            {currentStep === 2 && selectedTeamMember && (
              <ServiceStep
                services={teamMemberServices}
                selectedService={selectedService}
                onServiceChange={handleServiceChange}
                onBack={goToPreviousStep}
              />
            )}
            
            {/* Step 3: Select Insurance Plan */}
            {currentStep === 3 && selectedService && (
              <InsuranceStep
                insurancePlans={insurancePlans}
                selectedInsurance={selectedInsurance}
                onInsuranceChange={handleInsuranceChange}
                onBack={goToPreviousStep}
              />
            )}
            
            {/* Step 4: Select Date */}
            {currentStep === 4 && selectedInsurance && (
              <DateStep
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onBack={goToPreviousStep}
              />
            )}
            
            {/* Step 5: Select Time */}
            {currentStep === 5 && selectedDate && (
              <TimeStep
                availableSlots={availableSlots}
                onTimeSlotSelect={handleTimeSlotSelect}
                onBack={goToPreviousStep}
              />
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Selection summary */}
      {selectedTeamMember && (
        <BookingSelectionSummary
          selectedTeamMember={selectedTeamMember}
          selectedService={selectedService}
          selectedInsurance={selectedInsurance}
          selectedDate={selectedDate}
          teamMembers={teamMembers}
          services={services}
          insurancePlans={insurancePlans}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
