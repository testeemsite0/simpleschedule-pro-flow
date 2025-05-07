
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingCalendar from '@/components/booking/BookingCalendar';
import BookingForm from '@/components/booking/BookingForm';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useBooking } from '@/context/BookingContext';

const BookingContent: React.FC = () => {
  const { 
    professional,
    timeSlots,
    appointments,
    currentStep,
    selectedDate,
    selectedStartTime, 
    selectedEndTime,
    selectedTeamMember,
    clientName,
    appointmentId,
    setCurrentStep,
    setSelectedDate,
    setSelectedStartTime,
    setSelectedEndTime,
    setSelectedTeamMember,
    setClientName,
    setAppointmentId,
    setProfessional
  } = useBooking();
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    // Assegurar que as datas são tratadas como novos objetos
    const safeDate = new Date(date);
    
    setSelectedDate(safeDate);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setSelectedTeamMember(teamMemberId);
    
    // Importante: só avançar para o próximo passo se o usuário realmente confirmar
    // a seleção de horário pelo botão "Confirmar Horário"
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
          <BookingCalendar 
            professional={professional}
            timeSlots={timeSlots}
            appointments={appointments}
            onSelectSlot={handleSelectTimeSlot}
          />
        )}
        
        {currentStep === 'form' && selectedDate && (
          <BookingForm 
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
          <BookingConfirmation
            professional={professional}
            clientName={clientName}
            date={selectedDate}
            startTime={selectedStartTime}
            endTime={selectedEndTime}
            appointmentId={appointmentId}
            onClose={handleConfirmationClose}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BookingContent;
