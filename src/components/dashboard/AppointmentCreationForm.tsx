
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimeSlot, Appointment } from '@/types';
import { format } from 'date-fns';
import { timeToMinutes } from '../booking/timeUtils';

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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string, label: string }[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Helper function for time calculations
  const timeStringToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const minutesToTimeString = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Get all time slots for this day
    const daySlotsData = timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.available
    );
    
    // Get all booked slots for this date
    const bookedSlots = appointments.filter(app => 
      app.date === selectedDate && app.status === 'scheduled'
    );
    
    // Create a set of booked time slots for faster lookup
    const bookedTimeSlots = new Set(
      bookedSlots.map(app => app.start_time)
    );
    
    // Convert these into appointment slots
    const slots: { value: string, label: string }[] = [];
    
    daySlotsData.forEach(slot => {
      // Convert times to minutes for easier calculation
      const startMinutes = timeStringToMinutes(slot.start_time);
      const endMinutes = timeStringToMinutes(slot.end_time);
      const duration = slot.appointment_duration_minutes || 60;
      
      // Handle lunch break if present
      const lunchStartMinutes = slot.lunch_break_start ? timeStringToMinutes(slot.lunch_break_start) : null;
      const lunchEndMinutes = slot.lunch_break_end ? timeStringToMinutes(slot.lunch_break_end) : null;
      
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
        
        const startTime = minutesToTimeString(timeMinutes);
        const endTime = minutesToTimeString(timeMinutes + duration);
        
        // Skip if slot is already booked
        if (!bookedTimeSlots.has(startTime)) {
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
      return timeStringToMinutes(aStart) - timeStringToMinutes(bStart);
    });
    
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
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
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
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || availableTimeSlots.length === 0}>
          {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentCreationForm;
