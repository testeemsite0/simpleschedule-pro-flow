
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { TimeSlot, Appointment, Professional } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import { timeToMinutes, minutesToTime } from './timeUtils';

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
    
    const dayOfWeek = selectedDate.getDay();
    const slots: AvailableSlot[] = [];
    
    // Get all time slots for this day
    const daySlots = timeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    // Format selected date for database comparison
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Find all booked appointments for the selected date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    // Create a set of booked time slots for faster lookup
    const bookedTimeSlots = new Set(
      bookedAppointments.map(app => app.start_time)
    );
    
    // For each time slot, generate appointment time slots based on duration
    daySlots.forEach(slot => {
      // Get start and end times in minutes
      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      
      // Get lunch break times in minutes (if applicable)
      const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
      
      // Get appointment duration (default to 60 minutes if not specified)
      const duration = slot.appointment_duration_minutes || 60;
      
      // Generate possible appointment start times
      for (let time = startMinutes; time <= endMinutes - duration; time += duration) {
        const endTime = time + duration;
        
        // Skip if appointment overlaps with lunch break
        if (
          lunchStartMinutes !== null && 
          lunchEndMinutes !== null && 
          ((time < lunchEndMinutes && time + duration > lunchStartMinutes) || 
           (time >= lunchStartMinutes && time < lunchEndMinutes))
        ) {
          continue;
        }
        
        const startTimeStr = minutesToTime(time);
        
        // Check if this time slot is already booked
        if (!bookedTimeSlots.has(startTimeStr)) {
          slots.push({
            date: selectedDate,
            startTime: startTimeStr,
            endTime: minutesToTime(endTime)
          });
        }
      }
    });
    
    // Sort by start time
    slots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
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
