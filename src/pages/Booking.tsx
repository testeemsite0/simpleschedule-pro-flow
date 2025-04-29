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
import { Professional, Appointment, TimeSlot } from '@/types';
import { supabase } from '@/integrations/supabase/client';

type BookingStep = 'calendar' | 'form' | 'confirmation';

const Booking = () => {
  const { slug } = useParams<{ slug: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Find the professional by slug
  useEffect(() => {
    const fetchProfessionalData = async () => {
      setLoading(true);
      try {
        // Find professional from mock data for now
        // In a real app, this would fetch from Supabase
        const foundProfessional = professionals.find(p => p.slug === slug);
        
        if (foundProfessional) {
          setProfessional(foundProfessional);
          
          // Fetch professional's appointments and time slots
          const { data: appointmentsData } = await supabase
            .from('appointments')
            .select('*')
            .eq('professional_id', foundProfessional.id);
            
          const { data: timeSlotsData } = await supabase
            .from('time_slots')
            .select('*')
            .eq('professional_id', foundProfessional.id)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });
            
          // Cast the status type to match the Appointment interface
          setAppointments((appointmentsData || []).map(app => ({
            ...app,
            status: app.status as "scheduled" | "completed" | "canceled"
          })));
          setTimeSlots(timeSlotsData as TimeSlot[] || []);
        }
      } catch (error) {
        console.error("Error fetching professional data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfessionalData();
  }, [slug]);
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string) => {
    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setCurrentStep('form');
  };
  
  const handleBookingSuccess = (name: string, id: string) => {
    setClientName(name);
    setAppointmentId(id);
    setCurrentStep('confirmation');
    
    // Refresh appointments after booking
    if (professional) {
      supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professional.id)
        .then(({ data }) => {
          if (data) setAppointments(data);
        });
    }
  };
  
  const handleBookingFormCancel = () => {
    setCurrentStep('calendar');
  };
  
  const handleConfirmationClose = () => {
    setCurrentStep('calendar');
    setSelectedDate(null);
    setSelectedStartTime('');
    setSelectedEndTime('');
    setAppointmentId('');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center">Carregando...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;
