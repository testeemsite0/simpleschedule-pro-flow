
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingCalendar from '@/components/booking/BookingCalendar';
import BookingForm from '@/components/booking/BookingForm';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useAppointments } from '@/context/AppointmentContext';
import { professionals } from '@/data/mockData';
import { Professional } from '@/types';

type BookingStep = 'calendar' | 'form' | 'confirmation';

const Booking = () => {
  const { slug } = useParams<{ slug: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  
  const { appointments, timeSlots } = useAppointments();
  
  // Find the professional by slug
  useEffect(() => {
    const foundProfessional = professionals.find(p => p.slug === slug);
    setProfessional(foundProfessional || null);
  }, [slug]);
  
  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center">Profissional não encontrado</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string) => {
    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setCurrentStep('form');
  };
  
  const handleBookingSuccess = (name: string) => {
    setClientName(name);
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
  };
  
  // Filter timeSlots and appointments for this professional
  const professionalTimeSlots = timeSlots.filter(slot => 
    slot.professional_id === professional.id
  );
  
  const professionalAppointments = appointments.filter(appointment => 
    appointment.professional_id === professional.id
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Agendar com {professional.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {currentStep === 'calendar' && (
                <BookingCalendar 
                  professional={professional}
                  timeSlots={professionalTimeSlots}
                  appointments={professionalAppointments}
                  onSelectSlot={handleSelectTimeSlot}
                />
              )}
              
              {currentStep === 'form' && selectedDate && (
                <BookingForm 
                  professional={professional}
                  selectedDate={selectedDate}
                  startTime={selectedStartTime}
                  endTime={selectedEndTime}
                  onSuccess={() => handleBookingSuccess(clientName)}
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
                  onClose={handleConfirmationClose}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;
