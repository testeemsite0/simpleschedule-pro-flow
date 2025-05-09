
import React, { useEffect } from 'react';
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
  
  // Debug log current state
  useEffect(() => {
    console.log("BookingContent rendered with state:", {
      currentStep,
      selectedDate: selectedDate?.toISOString(),
      selectedStartTime,
      selectedEndTime
    });
  }, [currentStep, selectedDate, selectedStartTime, selectedEndTime]);
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    // Log the time slot selection
    console.log("Time slot selected:", { date, startTime, endTime, teamMemberId });
    
    // Create a new date object to avoid reference issues
    const safeDate = new Date(date);
    
    setSelectedDate(safeDate);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setSelectedTeamMember(teamMemberId);
    
    // Always advance to form step after selecting a time slot
    console.log("Transitioning from calendar to form step");
    setCurrentStep('form');
  };
  
  const handleBookingSuccess = async (name: string, id: string) => {
    // Log the booking success
    console.log("Booking success:", { name, id });
    
    setClientName(name);
    setAppointmentId(id);
    setCurrentStep('confirmation');
  };
  
  const handleBookingFormCancel = () => {
    // Log the form cancellation
    console.log("Booking form cancelled, returning to calendar step");
    setCurrentStep('calendar');
  };
  
  const handleConfirmationClose = () => {
    // Log the confirmation close
    console.log("Confirmation closed, resetting booking flow");
    
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
