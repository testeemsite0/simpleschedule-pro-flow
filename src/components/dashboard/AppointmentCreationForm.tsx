
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimeSlot, Appointment } from '@/types';
import { format } from 'date-fns';
import { timeToMinutes, minutesToTime, doTimeSlotsOverlap } from '../booking/timeUtils';
import DateSelector from '../booking/DateSelector';

interface AppointmentCreationFormProps {
  professionalId: string;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: {
    selectedDate: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => void;
}

const AppointmentCreationForm: React.FC<AppointmentCreationFormProps> = ({
  professionalId,
  timeSlots,
  appointments,
  isSubmitting,
  onCancel,
  onSubmit
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string, label: string }[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Generate available dates for selection based on time slots
  useEffect(() => {
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
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
    
    // Automatically select the first date if available
    if (dates.length > 0) {
      const firstDate = format(dates[0], 'yyyy-MM-dd');
      setSelectedDate(firstDate);
    }
  }, [timeSlots]);
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const date = new Date(selectedDate);
    // Use getDay() to get day of week (0-6)
    const dayOfWeek = date.getDay();
    console.log("Selected day of week for manual booking:", dayOfWeek);
    
    // Get all time slots for this day
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.available
    );
    
    console.log("Available time slots for day:", daySlotsData);
    
    // Get all booked slots for this date
    const bookedSlots = appointments.filter(app => 
      app.date === selectedDate && app.status === 'scheduled'
    );
    
    console.log("Booked appointments:", bookedSlots);
    
    // Convert these into appointment slots
    const slots: { value: string, label: string }[] = [];
    
    daySlotsData.forEach(slot => {
      // Convert times to minutes for easier calculation
      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Handle lunch break if present
      const lunchStartMinutes = slot.lunch_break_start ? timeToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeToMinutes(slot.lunch_break_end) : null;
      
      // Generate slots
      for (let timeMinutes = startMinutes; timeMinutes + duration <= endMinutes; timeMinutes += duration) {
        // Skip slots that overlap with lunch break
        if (
          lunchStartMinutes !== null && 
          lunchEndMinutes !== null && 
          ((timeMinutes < lunchEndMinutes && timeMinutes + duration > lunchStartMinutes) || 
           (timeMinutes >= lunchStartMinutes && timeMinutes < lunchEndMinutes))
        ) {
          continue;
        }
        
        const startTime = minutesToTime(timeMinutes);
        const endTime = minutesToTime(timeMinutes + duration);
        
        // Check if slot is already booked
        const isBooked = bookedSlots.some(app => {
          return doTimeSlotsOverlap(
            startTime, 
            endTime, 
            app.start_time, 
            app.end_time
          );
        });
        
        // Only add if not booked
        if (!isBooked) {
          const value = `${startTime}-${endTime}`;
          const label = `${startTime} - ${endTime}`;
          slots.push({ value, label });
        }
      }
    });
    
    // Sort by time
    slots.sort((a, b) => {
      const aStart = a.value.split('-')[0];
      const bStart = b.value.split('-')[0];
      return timeToMinutes(aStart) - timeToMinutes(bStart);
    });
    
    console.log("Available slots for manual booking:", slots);
    setAvailableTimeSlots(slots);
  }, [selectedDate, timeSlots, appointments]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
      return;
    }
    
    // Parse time slot
    const [startTime, endTime] = selectedTimeSlot.split('-');
    
    onSubmit({
      selectedDate,
      startTime,
      endTime,
      clientName,
      clientEmail,
      clientPhone,
      notes
    });
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Data</Label>
        <div className="mt-2">
          <DateSelector
            availableDates={availableDates}
            selectedDate={selectedDate ? new Date(selectedDate) : null}
            onSelectDate={handleDateSelect}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="timeSlot">Horário</Label>
        <Select
          value={selectedTimeSlot}
          onValueChange={setSelectedTimeSlot}
          disabled={availableTimeSlots.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent>
            {availableTimeSlots.map((slot) => (
              <SelectItem key={slot.value} value={slot.value}>
                {slot.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableTimeSlots.length === 0 && selectedDate && (
          <p className="text-sm text-amber-600 mt-2">
            Não há horários disponíveis para esta data.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientEmail">Email do Cliente</Label>
        <Input
          id="clientEmail"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientPhone">Telefone do Cliente</Label>
        <Input
          id="clientPhone"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || availableTimeSlots.length === 0 || !selectedTimeSlot}>
          {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentCreationForm;
