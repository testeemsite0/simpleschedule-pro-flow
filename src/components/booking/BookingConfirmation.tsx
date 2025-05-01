
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional } from '@/types';
import { ArrowRight, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingConfirmationProps {
  professional: Professional;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  appointmentId: string;
  onClose: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  professional,
  clientName,
  date,
  startTime,
  endTime,
  appointmentId,
  onClose
}) => {
  const { toast } = useToast();
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  
  const formattedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
  const handleAddToGoogleCalendar = () => {
    // Format date for Google Calendar
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes);
    
    const formatForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const eventTitle = `Consulta com ${professional.name}`;
    const eventDetails = `Agendamento confirmado com ${professional.name}\nData: ${formattedDate}\nHorário: ${startTime} - ${endTime}`;
    const eventLocation = professional.address || '';
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(eventLocation)}`;
    
    window.open(googleCalendarUrl, '_blank');
    
    toast({
      title: "Adicionando ao Google Calendar",
      description: "Redirecionando para o Google Calendar para adicionar este evento"
    });
  };
  
  const handleAddToOutlookCalendar = () => {
    // Format date for Outlook
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes);
    
    const eventTitle = `Consulta com ${professional.name}`;
    const eventBody = `Agendamento confirmado com ${professional.name}\nData: ${formattedDate}\nHorário: ${startTime} - ${endTime}`;
    const eventLocation = professional.address || '';
    
    // Format dates for Outlook
    const formatOutlookDate = (date: Date) => {
      return date.toISOString();
    };
    
    const outlookCalendarUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&startdt=${encodeURIComponent(formatOutlookDate(startDate))}&enddt=${encodeURIComponent(formatOutlookDate(endDate))}&body=${encodeURIComponent(eventBody)}&location=${encodeURIComponent(eventLocation)}`;
    
    window.open(outlookCalendarUrl, '_blank');
    
    toast({
      title: "Adicionando ao Outlook Calendar",
      description: "Redirecionando para o Microsoft Outlook para adicionar este evento"
    });
  };
  
  const handleCreateICS = () => {
    // Format date for ICS
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes);
    
    // Format dates for ICS
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, -1);
    };
    
    const eventTitle = `Consulta com ${professional.name}`;
    const eventDescription = `Agendamento confirmado com ${professional.name}\nData: ${formattedDate}\nHorário: ${startTime} - ${endTime}`;
    const eventLocation = professional.address || '';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SimpleSchedule//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:${eventTitle}`,
      `DTSTART:${formatICSDate(startDate)}Z`,
      `DTEND:${formatICSDate(endDate)}Z`,
      `DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}`,
      `LOCATION:${eventLocation}`,
      `UID:${appointmentId}@simpleschedule.com`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'DTSTAMP:' + formatICSDate(new Date()) + 'Z',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agendamento.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Arquivo de Calendário Baixado",
      description: "Um arquivo .ics foi baixado para adicionar ao seu calendário"
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-green-600">
          Agendamento Confirmado!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium">Olá, {clientName}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Seu agendamento foi confirmado com sucesso
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <p className="font-medium">Detalhes do agendamento</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Profissional:</span> {professional.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Data:</span> {formattedDate}
            </p>
            <p className="text-sm">
              <span className="font-medium">Horário:</span> {startTime} - {endTime}
            </p>
            <p className="text-sm">
              <span className="font-medium">Número da reserva:</span> {appointmentId.substring(0, 8)}
            </p>
          </div>
        </div>
        
        {!showCalendarOptions ? (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setShowCalendarOptions(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Adicionar ao meu calendário
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Escolha seu calendário:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToGoogleCalendar}
              >
                Google Calendar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToOutlookCalendar}
              >
                Outlook
              </Button>
              <Button
                variant="outline"
                className="w-full col-span-2"
                onClick={handleCreateICS}
              >
                Baixar arquivo .ics
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" onClick={onClose}>
          Concluir
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingConfirmation;
