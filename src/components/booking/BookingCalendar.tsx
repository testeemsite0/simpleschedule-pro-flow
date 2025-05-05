
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TimeSlot, Appointment, Professional, TeamMember, Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import { generateAvailableTimeSlots } from './timeUtils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight } from 'lucide-react';

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
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("none");
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
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
    if (!selectedTeamMember) {
      return [];
    }
    return timeSlots.filter(slot => 
      slot.team_member_id === selectedTeamMember
    );
  }, [timeSlots, selectedTeamMember]);
  
  // Generate next 14 days for selection based on filtered time slots
  useEffect(() => {
    if (isOverLimit || !selectedTeamMember || currentStep < 2) {
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
  }, [filteredTimeSlots, isOverLimit, selectedDate, selectedTeamMember, currentStep]);
  
  // When a date is selected, find available time slots
  useEffect(() => {
    if (!selectedDate || isOverLimit || currentStep < 3) {
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
  }, [selectedDate, filteredTimeSlots, appointments, isOverLimit, currentStep]);
  
  const handleTeamMemberChange = (value: string) => {
    setSelectedTeamMember(value);
    setSelectedService("none");
    setSelectedDate(null);
    setCurrentStep(2); // Move to service selection step
  };
  
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setCurrentStep(3); // Move to date selection step
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep(4); // Move to time selection step
  };
  
  const handleSelectTimeSlot = (date: Date, startTime: string, endTime: string, teamMemberId?: string) => {
    onSelectSlot(date, startTime, endTime, selectedTeamMember);
  };
  
  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
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
      {/* Steps indicator */}
      <div className="flex justify-between mb-8">
        <div className={`flex flex-col items-center ${getStepStatus(1) === "completed" ? "text-primary" : getStepStatus(1) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
            getStepStatus(1) === "completed" ? "bg-primary text-primary-foreground" : 
            getStepStatus(1) === "current" ? "border-2 border-primary text-primary" : 
            "border-2 border-muted text-muted-foreground"
          }`}>
            {getStepStatus(1) === "completed" ? <CheckCircle className="w-5 h-5" /> : "1"}
          </div>
          <span className="text-xs">Profissional</span>
        </div>
        <div className="flex-1 flex items-center mx-2">
          <div className={`h-0.5 w-full ${currentStep > 1 ? "bg-primary" : "bg-muted"}`}></div>
        </div>
        <div className={`flex flex-col items-center ${getStepStatus(2) === "completed" ? "text-primary" : getStepStatus(2) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
            getStepStatus(2) === "completed" ? "bg-primary text-primary-foreground" : 
            getStepStatus(2) === "current" ? "border-2 border-primary text-primary" : 
            "border-2 border-muted text-muted-foreground"
          }`}>
            {getStepStatus(2) === "completed" ? <CheckCircle className="w-5 h-5" /> : "2"}
          </div>
          <span className="text-xs">Serviço</span>
        </div>
        <div className="flex-1 flex items-center mx-2">
          <div className={`h-0.5 w-full ${currentStep > 2 ? "bg-primary" : "bg-muted"}`}></div>
        </div>
        <div className={`flex flex-col items-center ${getStepStatus(3) === "completed" ? "text-primary" : getStepStatus(3) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
            getStepStatus(3) === "completed" ? "bg-primary text-primary-foreground" : 
            getStepStatus(3) === "current" ? "border-2 border-primary text-primary" : 
            "border-2 border-muted text-muted-foreground"
          }`}>
            {getStepStatus(3) === "completed" ? <CheckCircle className="w-5 h-5" /> : "3"}
          </div>
          <span className="text-xs">Data</span>
        </div>
        <div className="flex-1 flex items-center mx-2">
          <div className={`h-0.5 w-full ${currentStep > 3 ? "bg-primary" : "bg-muted"}`}></div>
        </div>
        <div className={`flex flex-col items-center ${getStepStatus(4) === "completed" ? "text-primary" : getStepStatus(4) === "current" ? "text-foreground" : "text-muted-foreground"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
            getStepStatus(4) === "completed" ? "bg-primary text-primary-foreground" : 
            getStepStatus(4) === "current" ? "border-2 border-primary text-primary" : 
            "border-2 border-muted text-muted-foreground"
          }`}>
            {getStepStatus(4) === "completed" ? <CheckCircle className="w-5 h-5" /> : "4"}
          </div>
          <span className="text-xs">Horário</span>
        </div>
      </div>

      {/* Step 1: Select Professional */}
      {currentStep === 1 && teamMembers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Escolha um profissional
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <Button
                  key={member.id} 
                  variant="outline"
                  className={`flex justify-between items-center p-4 h-auto ${selectedTeamMember === member.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => handleTeamMemberChange(member.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{member.name}</span>
                    {member.position && <span className="text-xs text-muted-foreground">{member.position}</span>}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Select Service */}
      {currentStep === 2 && services.length > 0 && selectedTeamMember && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Escolha um serviço
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className={`flex justify-between items-center p-4 h-auto ${selectedService === "none" ? "border-primary bg-primary/5" : ""}`}
                onClick={() => handleServiceChange("none")}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Consulta padrão</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              {services.map(service => (
                <Button
                  key={service.id}
                  variant="outline"
                  className={`flex justify-between items-center p-4 h-auto ${selectedService === service.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => handleServiceChange(service.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Voltar
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Select Date */}
      {currentStep === 3 && selectedTeamMember && (
        <div className="space-y-4">
          <DateSelector 
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Voltar
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 4: Select Time */}
      {currentStep === 4 && selectedDate && (
        <div className="space-y-4">
          <TimeSlotSelector 
            availableSlots={availableSlots}
            onSelectSlot={handleSelectTimeSlot}
          />
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              Voltar
            </Button>
          </div>
        </div>
      )}
      
      {/* Selected options summary */}
      {selectedTeamMember && (
        <div className="mt-6 p-4 bg-accent/30 rounded-md">
          <h3 className="font-medium mb-2">Seleção atual:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profissional:</span>
              <span className="font-medium">
                {teamMembers.find(m => m.id === selectedTeamMember)?.name || ''}
                {teamMembers.find(m => m.id === selectedTeamMember)?.position ? 
                  ` - ${teamMembers.find(m => m.id === selectedTeamMember)?.position}` : ''}
              </span>
            </div>
            
            {selectedService !== "none" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço:</span>
                <span className="font-medium">
                  {services.find(s => s.id === selectedService)?.name || 'Consulta padrão'}
                </span>
              </div>
            )}
            
            {selectedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{format(selectedDate, 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
