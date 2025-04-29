
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TimeSlot, Appointment, Professional } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const { count, error } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: false })
          .eq('professional_id', professional.id)
          .eq('status', 'scheduled')
          .gte('date', firstDayOfMonth.toISOString().split('T')[0])
          .lte('date', lastDayOfMonth.toISOString().split('T')[0]);
          
        if (error) throw error;
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
    
    // For each time slot, check if it's already booked
    daySlots.forEach(slot => {
      const isBooked = appointments.some(app => {
        const appDate = new Date(app.date);
        return (
          app.status === 'scheduled' &&
          isSameDay(appDate, selectedDate) &&
          app.start_time === slot.start_time &&
          app.end_time === slot.end_time
        );
      });
      
      if (!isBooked) {
        slots.push({
          date: selectedDate,
          startTime: slot.start_time,
          endTime: slot.end_time
        });
      }
    });
    
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
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Escolha uma data
        </h2>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {availableDates.map((date) => (
            <Button
              key={date.toString()}
              variant={isSameDay(date, selectedDate || new Date()) ? "default" : "outline"}
              className="min-w-[110px] flex-col h-auto py-2"
              onClick={() => setSelectedDate(date)}
            >
              <span className="text-xs font-normal">
                {format(date, 'EEEE', { locale: ptBR })}
              </span>
              <span className="font-semibold">
                {format(date, 'dd/MM', { locale: ptBR })}
              </span>
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Horários disponíveis
        </h2>
        
        {availableSlots.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Não há horários disponíveis para esta data.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3"
                onClick={() => onSelectSlot(slot.date, slot.startTime, slot.endTime)}
              >
                {slot.startTime} - {slot.endTime}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
