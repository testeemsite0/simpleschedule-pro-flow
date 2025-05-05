
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TimeSlot, Appointment, Professional, TeamMember, Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import { generateAvailableTimeSlots } from './timeUtils';

interface BookingCalendarProps {
  professional: Professional;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onSelectSlot: (date: Date, startTime: string, endTime: string, teamMemberId?: string) => void;
}

interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  teamMemberId?: string;
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("none");
  const [selectedService, setSelectedService] = useState<string>("none");
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  
  // Fetch team members and services
  useEffect(() => {
    const fetchTeamAndServices = async () => {
      try {
        // Fetch team members
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (teamMembersError) throw teamMembersError;
        setTeamMembers(teamMembersData || []);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professional.id)
          .eq('active', true);
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
      } catch (error) {
        console.error("Error fetching team members and services:", error);
      }
    };
    
    fetchTeamAndServices();
  }, [professional.id]);
  
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
  
  // Filter time slots based on team member selection
  const filteredTimeSlots = React.useMemo(() => {
    if (selectedTeamMember === "none") {
      return timeSlots;
    }
    return timeSlots.filter(slot => 
      slot.team_member_id === selectedTeamMember || !slot.team_member_id
    );
  }, [timeSlots, selectedTeamMember]);
  
  // Generate next 14 days for selection based on filtered time slots
  useEffect(() => {
    if (isOverLimit || !selectedTeamMember) {
      setAvailableDates([]);
      return;
    }
    
    const dates: Date[] = [];
    const now = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      
      // Check if there are available slots for this day of week
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
  }, [filteredTimeSlots, isOverLimit, selectedDate, selectedTeamMember]);
  
  // When a date is selected, find available time slots
  useEffect(() => {
    if (!selectedDate || isOverLimit || !showTimeSelector) {
      setAvailableSlots([]);
      return;
    }
    
    // Important: JavaScript uses 0-6 for day of week (0 = Sunday)
    const dayOfWeek = selectedDate.getDay();
    console.log("Selected day of week:", dayOfWeek);
    
    // Get all time slots for this day
    const daySlots = filteredTimeSlots.filter(
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
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, showTimeSelector]);
  
  const handleTeamMemberChange = (value: string) => {
    setSelectedTeamMember(value);
    setSelectedService("none");
    setShowDateSelector(value !== "none");
    setShowTimeSelector(false);
    setSelectedDate(null);
  };
  
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowTimeSelector(true);
  };
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    const effectiveTeamMemberId = selectedTeamMember !== "none" ? selectedTeamMember : teamMemberId;
    onSelectSlot(date, startTime, endTime, effectiveTeamMemberId);
  };
  
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
      {/* Step 1: Select Professional */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="teamMember">Profissional</Label>
          <Select value={selectedTeamMember} onValueChange={handleTeamMemberChange}>
            <SelectTrigger id="teamMember">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Qualquer profissional disponível</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} {member.position ? `- ${member.position}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Step 2: Select Service */}
      {services.length > 0 && selectedTeamMember !== "none" && (
        <div className="space-y-2">
          <Label htmlFor="service">Serviço</Label>
          <Select value={selectedService} onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Consulta padrão</SelectItem>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Step 3: Select Date */}
      {showDateSelector && (
        <DateSelector 
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      )}
      
      {/* Step 4: Select Time */}
      {showTimeSelector && selectedDate && (
        <TimeSlotSelector 
          availableSlots={availableSlots}
          onSelectSlot={handleSelectTimeSlot}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
