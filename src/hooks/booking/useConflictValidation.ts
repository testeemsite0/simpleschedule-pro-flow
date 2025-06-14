
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConflictCheck {
  hasConflict: boolean;
  conflictDetails?: {
    appointmentId: string;
    clientName: string;
    startTime: string;
    endTime: string;
  };
}

export const useConflictValidation = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkTimeConflict = useCallback(async (
    professionalId: string,
    teamMemberId: string | undefined,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<ConflictCheck> => {
    setIsChecking(true);
    
    try {
      console.log('Checking for conflicts:', {
        professionalId,
        teamMemberId,
        date,
        startTime,
        endTime,
        excludeAppointmentId
      });

      // Build the query
      let query = supabase
        .from('appointments')
        .select('id, client_name, start_time, end_time, team_member_id')
        .eq('professional_id', professionalId)
        .eq('date', date)
        .eq('status', 'scheduled');

      // Filter by team member if specified
      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      }

      // Exclude current appointment if editing
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: existingAppointments, error } = await query;

      if (error) {
        console.error('Error checking conflicts:', error);
        toast.error('Erro ao verificar conflitos de horário');
        return { hasConflict: false };
      }

      // Check for time overlaps
      const newStart = new Date(`2000-01-01T${startTime}`);
      const newEnd = new Date(`2000-01-01T${endTime}`);

      for (const appointment of existingAppointments || []) {
        const existingStart = new Date(`2000-01-01T${appointment.start_time}`);
        const existingEnd = new Date(`2000-01-01T${appointment.end_time}`);

        // Check if times overlap
        const hasOverlap = (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );

        if (hasOverlap) {
          console.log('Conflict found:', appointment);
          return {
            hasConflict: true,
            conflictDetails: {
              appointmentId: appointment.id,
              clientName: appointment.client_name,
              startTime: appointment.start_time,
              endTime: appointment.end_time
            }
          };
        }
      }

      console.log('No conflicts found');
      return { hasConflict: false };
    } catch (error) {
      console.error('Error in conflict validation:', error);
      toast.error('Erro ao validar horário');
      return { hasConflict: false };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const validateBusinessHours = useCallback(async (
    professionalId: string,
    teamMemberId: string | undefined,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      console.log('Validating business hours:', {
        professionalId,
        teamMemberId,
        date,
        startTime,
        endTime
      });

      const dayOfWeek = new Date(date).getDay();

      // Build query for time slots
      let query = supabase
        .from('time_slots')
        .select('start_time, end_time, lunch_break_start, lunch_break_end')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('available', true);

      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      }

      const { data: timeSlots, error } = await query;

      if (error) {
        console.error('Error validating business hours:', error);
        return false;
      }

      if (!timeSlots || timeSlots.length === 0) {
        toast.error('Não há horários disponíveis para este dia');
        return false;
      }

      const appointmentStart = new Date(`2000-01-01T${startTime}`);
      const appointmentEnd = new Date(`2000-01-01T${endTime}`);

      for (const slot of timeSlots) {
        const slotStart = new Date(`2000-01-01T${slot.start_time}`);
        const slotEnd = new Date(`2000-01-01T${slot.end_time}`);

        // Check if appointment is within business hours
        if (appointmentStart >= slotStart && appointmentEnd <= slotEnd) {
          // Check lunch break if exists
          if (slot.lunch_break_start && slot.lunch_break_end) {
            const lunchStart = new Date(`2000-01-01T${slot.lunch_break_start}`);
            const lunchEnd = new Date(`2000-01-01T${slot.lunch_break_end}`);

            // Check if appointment overlaps with lunch break
            const overlapWithLunch = (
              (appointmentStart >= lunchStart && appointmentStart < lunchEnd) ||
              (appointmentEnd > lunchStart && appointmentEnd <= lunchEnd) ||
              (appointmentStart <= lunchStart && appointmentEnd >= lunchEnd)
            );

            if (overlapWithLunch) {
              toast.error('Horário conflita com o intervalo de almoço');
              return false;
            }
          }

          return true;
        }
      }

      toast.error('Horário fora do expediente');
      return false;
    } catch (error) {
      console.error('Error validating business hours:', error);
      return false;
    }
  }, []);

  return {
    checkTimeConflict,
    validateBusinessHours,
    isChecking
  };
};
