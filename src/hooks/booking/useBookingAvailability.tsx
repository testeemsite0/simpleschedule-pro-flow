
import { useState, useEffect } from 'react';
import { TeamMember, TimeSlot, Appointment } from '@/types';
import { useAvailabilityCalculation } from './useAvailabilityCalculation';

interface UseBookingAvailabilityProps {
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  selectedTeamMemberId?: string;
  selectedDate?: Date | null;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingAvailability = ({
  timeSlots,
  appointments,
  selectedTeamMemberId,
  selectedDate
}: UseBookingAvailabilityProps) => {
  const { availableDates, availableSlots } = useAvailabilityCalculation({
    timeSlots,
    appointments,
    teamMemberId: selectedTeamMemberId,
    date: selectedDate
  });

  const calculateAvailableSlots = async (params: {
    professionalId: string;
    teamMemberId: string;
    date: Date;
    serviceDuration: number;
  }) => {
    // Filter timeSlots for the specific professional and team member
    const filteredTimeSlots = timeSlots.filter(slot => 
      slot.professional_id === params.professionalId &&
      (!params.teamMemberId || slot.team_member_id === params.teamMemberId)
    );

    // Use the availability calculation with filtered data
    const { availableSlots: calculatedSlots } = useAvailabilityCalculation({
      timeSlots: filteredTimeSlots,
      appointments,
      teamMemberId: params.teamMemberId,
      date: params.date
    });

    return calculatedSlots;
  };

  return {
    availableDates,
    availableSlots,
    calculateAvailableSlots
  };
};
