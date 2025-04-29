
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Professional } from '@/types';
import { CalendarDaysIcon } from 'lucide-react';

interface BookingConfirmationProps {
  professional: Professional;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  appointmentId: string;
  onClose: () => void;
}

const BookingConfirmation = ({
  professional,
  clientName,
  date,
  startTime,
  endTime,
  appointmentId,
  onClose
}: BookingConfirmationProps) => {
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });
  
  // Format the event for calendar integration
  const createGoogleCalendarEvent = () => {
    // Format date and time for Google Calendar
    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute);
    
    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute);
    
    // Format dates for Google Calendar URL
    const formatDateForGCal = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const eventDetails = {
      text: `Agendamento com ${professional.name}`,
      dates: `${formatDateForGCal(startDateTime)}/${formatDateForGCal(endDateTime)}`,
      details: `Seu agendamento com ${professional.name} (${professional.profession})`,
      location: 'Online'
    };
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };
  
  // Format for Outlook calendar
  const createOutlookCalendarEvent = () => {
    // Format date and time for Outlook
    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute);
    
    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute);
    
    // Format dates for Outlook URL
    const formatDateForOutlook = (date: Date) => {
      return date.toISOString();
    };
    
    const eventDetails = {
      subject: `Agendamento com ${professional.name}`,
      start: formatDateForOutlook(startDateTime),
      end: formatDateForOutlook(endDateTime),
      body: `Seu agendamento com ${professional.name} (${professional.profession})`,
      location: 'Online'
    };
    
    const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventDetails.subject)}&startdt=${eventDetails.start}&enddt=${eventDetails.end}&body=${encodeURIComponent(eventDetails.body)}&location=${encodeURIComponent(eventDetails.location)}`;
    
    window.open(outlookUrl, '_blank');
  };
  
  return (
    <div className="text-center py-4">
      <div className="mb-6">
        <div className="bg-green-50 text-green-700 p-2 rounded-full inline-flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Agendamento Confirmado!</h2>
      
      <p className="mb-1 text-gray-600">
        Olá, <span className="font-medium">{clientName}</span>
      </p>
      
      <p className="mb-6 text-gray-600">
        Seu agendamento com <span className="font-medium">{professional.name}</span> foi confirmado para {formattedDate} às {startTime}.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center justify-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          Adicionar ao seu calendário
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={createGoogleCalendarEvent}
            className="w-full sm:w-auto"
          >
            Google Calendar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={createOutlookCalendarEvent}
            className="w-full sm:w-auto"
          >
            Microsoft Outlook
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Código de confirmação: <span className="font-mono">{appointmentId.slice(0, 8)}</span>
      </p>
      
      <Button onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
};

export default BookingConfirmation;
