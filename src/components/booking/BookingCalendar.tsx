
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
    handleTeamMemberChange,
    handleInsuranceChange,
    handleServiceChange,
    handleDateSelect,
    goToPreviousStep,
  } = useBookingCalendar({
    professionalId: professional.id,
    timeSlots,
    appointments
  });
  
  // Define booking steps
  const steps = [
    { id: 1, label: 'Profissional' },
    { id: 2, label: 'Convênio' },
    { id: 3, label: 'Serviço' },
    { id: 4, label: 'Data' },
    { id: 5, label: 'Horário' }
  ];
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    // Pass the selected team member ID from our state
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
  
  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <BookingStepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1: Select Professional */}
      {currentStep === 1 && teamMembers.length > 0 && (
        <ProfessionalStep 
          teamMembers={teamMembers}
          selectedTeamMember={selectedTeamMember}
          onTeamMemberChange={handleTeamMemberChange}
        />
      )}
      
      {/* Step 2: Select Insurance Plan */}
      {currentStep === 2 && selectedTeamMember && (
        <InsuranceStep
          insurancePlans={insurancePlans}
          selectedInsurance={selectedInsurance}
          onInsuranceChange={handleInsuranceChange}
          onBack={goToPreviousStep}
        />
      )}
      
      {/* Step 3: Select Service */}
      {currentStep === 3 && selectedTeamMember && (
        <ServiceStep
          services={services}
          selectedService={selectedService}
          onServiceChange={handleServiceChange}
          onBack={goToPreviousStep}
        />
      )}
      
      {/* Step 4: Select Date */}
      {currentStep === 4 && selectedTeamMember && (
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
      
      {/* Selection summary */}
      {selectedTeamMember && (
        <BookingSelectionSummary
          selectedTeamMember={selectedTeamMember}
          selectedInsurance={selectedInsurance}
          selectedService={selectedService}
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
