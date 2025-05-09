
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBooking } from '@/context/BookingContext';
import { BookingCalendarSection } from './sections/BookingCalendarSection';
import { BookingFormSection } from './sections/BookingFormSection';
import { BookingConfirmationSection } from './sections/BookingConfirmationSection';

const BookingContent: React.FC = () => {
  const { 
    professional,
    currentStep,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedTeamMember,
    setCurrentStep,
    setSelectedDate,
    setSelectedStartTime,
    setSelectedEndTime,
    setSelectedTeamMember,
    setClientName,
    setAppointmentId,
  } = useBooking();
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    // Assegurar que as datas são tratadas como novos objetos
    const safeDate = new Date(date);
    
    setSelectedDate(safeDate);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setSelectedTeamMember(teamMemberId);
    
    // Avançar para o próximo passo quando o usuário selecionar um horário
    setCurrentStep('form');
  };
  
  const handleBookingSuccess = async (name: string, id: string) => {
    setClientName(name);
    setAppointmentId(id);
    setCurrentStep('confirmation');
  };
  
  const handleBookingFormCancel = () => {
    setCurrentStep('calendar');
  };
  
  const handleConfirmationClose = () => {
    setCurrentStep('calendar');
    setSelectedDate(null);
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedTeamMember(undefined);
    setAppointmentId('');
  };
  
  if (!professional) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center">Profissional não encontrado</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Agendar com {professional.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {currentStep === 'calendar' && (
          <BookingCalendarSection
            professional={professional}
            onSelectSlot={handleSelectTimeSlot}
          />
        )}
        
        {currentStep === 'form' && selectedDate && (
          <BookingFormSection
            professional={professional}
            selectedDate={selectedDate}
            startTime={selectedStartTime}
            endTime={selectedEndTime}
            selectedTeamMember={selectedTeamMember}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingFormCancel}
          />
        )}
        
        {currentStep === 'confirmation' && selectedDate && (
          <BookingConfirmationSection
            professional={professional}
            onClose={handleConfirmationClose}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BookingContent;
