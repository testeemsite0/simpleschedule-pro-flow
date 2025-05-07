
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, Service, Appointment, TimeSlot, InsurancePlan } from '@/types';
import { addDays, startOfDay, isBefore } from 'date-fns';

interface UseBookingCalendarProps {
  professionalId: string;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
}

export const useBookingCalendar = ({ professionalId, timeSlots, appointments }: UseBookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedInsurance, setSelectedInsurance] = useState<string>("none");
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members, services, and insurance plans
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching team members for professional:", professionalId);
        
        // Fetch team members
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (teamMembersError) {
          console.error("Error fetching team members:", teamMembersError);
          setError("Não foi possível carregar os profissionais");
          throw teamMembersError;
        }
        
        console.log("Team members loaded:", teamMembersData?.length || 0);
        setTeamMembers(teamMembersData || []);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true);
          
        if (servicesError) {
          console.error("Error fetching services:", servicesError);
          setError("Não foi possível carregar os serviços");
          throw servicesError;
        }
        
        console.log("Services loaded:", servicesData?.length || 0);
        setServices(servicesData || []);
        
        // Fetch insurance plans
        const { data: insurancePlansData, error: insurancePlansError } = await supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId);
          
        if (insurancePlansError) {
          console.error("Error fetching insurance plans:", insurancePlansError);
          setError("Não foi possível carregar os convênios");
          throw insurancePlansError;
        }
        
        console.log("Insurance plans loaded:", insurancePlansData?.length || 0);
        setInsurancePlans(insurancePlansData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (professionalId) {
      fetchData();
    }
  }, [professionalId]);
  
  // Check appointment limits
  useEffect(() => {
    const checkAppointmentLimit = async () => {
      if (!professionalId) return;
      
      try {
        // Count current month's scheduled appointments
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { count, error } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: false })
          .eq('professional_id', professionalId)
          .eq('status', 'scheduled')
          .gte('date', firstDayOfMonth.toISOString().split('T')[0]);
          
        if (error) {
          console.error("Error checking appointment limit:", error);
          throw error;
        }

        setIsOverLimit(count !== null && count >= 5);
      } catch (error) {
        console.error("Error checking appointment limit:", error);
      }
    };
    
    checkAppointmentLimit();
  }, [professionalId]);

  // Filter time slots based on team member selection
  const filteredTimeSlots = timeSlots.filter(slot => 
    !selectedTeamMember || slot.team_member_id === selectedTeamMember
  );
  
  // Generate available dates
  useEffect(() => {
    if (isOverLimit || !selectedTeamMember || currentStep < 4) {
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Skip past dates
      if (isBefore(date, now)) continue;
      
      // Check for available slots on this day
      const hasAvailableSlots = filteredTimeSlots.some(
        slot => slot.day_of_week === dayOfWeek && slot.available
      );
      
      if (hasAvailableSlots) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
    
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [filteredTimeSlots, isOverLimit, selectedDate, selectedTeamMember, currentStep]);
  
  // Generate available time slots
  useEffect(() => {
    if (!selectedDate || isOverLimit || currentStep < 5) {
      setAvailableSlots([]);
      return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    
    // Get all time slots for this day
    const daySlots = filteredTimeSlots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.available
    );
    
    if (daySlots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Format selected date for appointment filtering
    const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
    
    // Find booked appointments for this date
    const bookedAppointments = appointments.filter(app => 
      app.date === formattedSelectedDate && app.status === 'scheduled'
    );
    
    // Import function from timeUtils.ts to generate available slots
    const { generateAvailableTimeSlots } = require('../booking/timeUtils');
    const slots = generateAvailableTimeSlots(daySlots, bookedAppointments, selectedDate);
    
    // Sort by start time
    slots.sort((a: AvailableSlot, b: AvailableSlot) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    setAvailableSlots(slots);
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, currentStep]);
  
  // Step navigation handlers
  const handleTeamMemberChange = (value: string) => {
    console.log("Team member selected:", value);
    setSelectedTeamMember(value);
    setSelectedService("");
    setSelectedInsurance("none");
    setSelectedDate(null);
    setCurrentStep(2);
  };
  
  const handleInsuranceChange = (value: string) => {
    console.log("Insurance selected:", value);
    setSelectedInsurance(value);
    setCurrentStep(3);
  };
  
  const handleServiceChange = (value: string) => {
    console.log("Service selected:", value);
    setSelectedService(value);
    setCurrentStep(4);
  };
  
  const handleDateSelect = (date: Date) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setCurrentStep(5);
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return {
    selectedDate,
    availableDates,
    availableSlots,
    teamMembers,
    services,
    selectedTeamMember,
    selectedService,
    selectedInsurance,
    insurancePlans,
    isOverLimit,
    loading,
    currentStep,
    error,
    filteredTimeSlots,
    handleTeamMemberChange,
    handleInsuranceChange,
    handleServiceChange,
    handleDateSelect,
    goToPreviousStep,
  };
};
