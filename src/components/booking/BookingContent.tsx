
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { BookingCalendarSection } from './sections/BookingCalendarSection';
import { BookingFormSection } from './sections/BookingFormSection';
import { BookingConfirmationSection } from './sections/BookingConfirmationSection';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { UnifiedBookingForm } from './UnifiedBookingForm';

const BookingContent: React.FC = () => {
  const { 
    professional,
    currentStep,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedTeamMember,
    loading,
    setCurrentStep,
    setSelectedDate,
    setSelectedStartTime,
    setSelectedEndTime,
    setSelectedTeamMember,
    setClientName,
    setAppointmentId,
  } = useBooking();
  
  // Use unified booking system for simpler flow
  const useUnifiedSystem = true;
  
  // Debug log current state
  useEffect(() => {
    console.log("BookingContent rendered with state:", {
      professional,
      currentStep,
      selectedDate: selectedDate?.toISOString(),
      selectedStartTime,
      selectedEndTime,
      loading
    });
  }, [currentStep, selectedDate, selectedStartTime, selectedEndTime, professional, loading]);
  
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
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center py-8">Carregando informações de agendamento...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!professional) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profissional não encontrado. Verifique o link de agendamento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Use the unified booking system if enabled
  if (useUnifiedSystem) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Agendar com {professional.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <UnifiedBookingProvider professionalId={professional.id} initialStep="team-member">
            <UnifiedBookingForm title={`Agendar com ${professional.name}`} />
          </UnifiedBookingProvider>
        </CardContent>
      </Card>
    );
  }
  
  // If not using unified system, use the original implementation
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
