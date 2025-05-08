
import { useState, useEffect } from 'react';
import { TimeSlot, Appointment } from '@/types';
import { addDays, startOfDay, isBefore } from 'date-fns';

interface UseBookingSlotsProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  selectedTeamMember: string;
  selectedService: string; // Adiciona parâmetro de serviço
  isOverLimit: boolean;
  currentStep: number;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingSlots = ({
  timeSlots,
  appointments,
  selectedTeamMember,
  selectedService, // Inclui serviço na desestruturação
  isOverLimit,
  currentStep
}: UseBookingSlotsProps) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filtra time slots com base na seleção de membro da equipe
  const filteredTimeSlots = timeSlots.filter(slot => 
    !selectedTeamMember || slot.team_member_id === selectedTeamMember
  );
  
  // Gera datas disponíveis
  useEffect(() => {
    if (isOverLimit || !selectedTeamMember || !selectedService || currentStep < 4) {
      setAvailableDates([]);
      return;
    }
    
    console.log("Generating available dates with:", { selectedTeamMember, selectedService, currentStep });
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Pula datas anteriores
      if (isBefore(date, now)) continue;
      
      // Verifica se há slots disponíveis neste dia
      const hasAvailableSlots = filteredTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      // Só adiciona datas que têm timeslots disponíveis
      if (hasAvailableSlots) {
        // Formata data selecionada para filtragem de agendamentos
        const formattedDate = date.toISOString().split('T')[0];
        
        // Encontra agendamentos reservados para esta data
        const bookedAppointments = appointments.filter(app => 
          app.date === formattedDate && app.status === 'scheduled'
        );
        
        // Obtém todos os slots para este dia
        const daySlots = filteredTimeSlots.filter(
          slot => slot.day_of_week === dayOfWeek && slot.available
        );
        
        // Verifica se realmente há timeslots disponíveis após considerar agendamentos marcados
        if (daySlots.length > 0) {
          try {
            // Importa função de timeUtils.ts para gerar slots disponíveis
            const { generateAvailableTimeSlots } = require('../../booking/timeUtils');
            const availableTimeSlots = generateAvailableTimeSlots(daySlots, bookedAppointments, date);
            
            // Só adiciona a data se houver timeslots disponíveis reais após filtragem
            if (availableTimeSlots && availableTimeSlots.length > 0) {
              dates.push(date);
            }
          } catch (error) {
            console.error("Error generating available time slots:", error);
          }
        }
      }
    }
    
    setAvailableDates(dates);
    console.log("Available dates generated:", dates.length);
    
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    } else if (dates.length === 0) {
      setSelectedDate(null);
    }
  }, [filteredTimeSlots, appointments, isOverLimit, selectedDate, selectedTeamMember, selectedService, currentStep]);
  
  // Gera slots de horário disponíveis
  useEffect(() => {
    if (!selectedDate || isOverLimit || currentStep < 5) {
      setAvailableSlots([]);
      return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    
    // Obtém todos os slots para este dia
    const daySlots = filteredTimeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    if (daySlots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Formata a data selecionada para filtragem de agendamentos
    const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
    
    // Encontra agendamentos marcados para esta data
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    try {
      // Importa função de timeUtils.ts para gerar slots disponíveis
      const { generateAvailableTimeSlots } = require('../../booking/timeUtils');
      const slots = generateAvailableTimeSlots(daySlots, bookedAppointments, selectedDate);
      
      if (slots && slots.length > 0) {
        // Ordena por horário de início
        slots.sort((a: AvailableSlot, b: AvailableSlot) => {
          const timeA = a.startTime.split(':').map(Number);
          const timeB = b.startTime.split(':').map(Number);
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
        
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error generating available time slots:", error);
      setAvailableSlots([]);
    }
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, currentStep]);

  return {
    availableDates,
    availableSlots,
    selectedDate,
    filteredTimeSlots,
    setSelectedDate
  };
};
