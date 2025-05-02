
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { TimeSlot, Appointment, Professional } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import { generateAvailableTimeSlots } from './timeUtils';

interface BookingCalendarProps {
  professional: Professional;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onSelectSlot: (date: Date, startTime: string, endTime: string) => void;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  professional,
  timeSlots,
  appointments,
  onSelectSlot
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if professional has reached the free plan limit
  useEffect(() => {
    const checkAppointmentLimit = async () => {
      setLoading(true);
      try {
        // Count current month's scheduled appointments
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { count, error } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: false })
          .eq('professional_id', professional.id)
          .eq('status', 'scheduled')
          .gte('date', firstDayOfMonth.toISOString().split('T')[0]);
          
        if (error) {
          console.error("Error checking appointment limit:", error);
          throw error;
        }

        setIsOverLimit(count !== null && count >= 5);
      } catch (error) {
        console.error("Error checking appointment limit:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAppointmentLimit();
  }, [professional.id]);
  
  // Generate next 14 days for selection
  useEffect(() => {
    if (isOverLimit) {
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Check if there are available slots for this day of week
      const hasAvailableSlots = timeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      if (hasAvailableSlots) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
    
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [timeSlots, isOverLimit]);
  
  // When a date is selected, find available time slots
  useEffect(() => {
    if (!selectedDate || isOverLimit) {
      setAvailableSlots([]);
      return;
    }
    
    // Important: JavaScript uses 0-6 for day of week (0 = Sunday)
    const dayOfWeek = selectedDate.getDay();
    console.log("Selected day of week:", dayOfWeek);
    
    // Get all time slots for this day
    const daySlots = timeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    console.log("Available time slots for day:", daySlots);
    
    if (daySlots.length === 0) {
      console.log("No time slots configured for this day");
      setAvailableSlots([]);
      return;
    }
    
    // Format selected date for database comparison
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Find all booked appointments for the selected date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    console.log("Booked appointments for date:", bookedAppointments);
    
    // Generate available slots based on day slots and booked appointments
    const slots = generateAvailableTimeSlots(daySlots, bookedAppointments, selectedDate);
    
    // Sort by start time
    slots.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    console.log("Final available slots:", slots);
    setAvailableSlots(slots);
  }, [selectedDate, timeSlots, appointments, isOverLimit]);
  
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
      <DateSelector 
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      
      <TimeSlotSelector 
        availableSlots={availableSlots}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
};

export default BookingCalendar;
