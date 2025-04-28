
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Professional } from '@/types';
import { Calendar, Check, Mail } from 'lucide-react';

interface BookingConfirmationProps {
  professional: Professional;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  professional,
  clientName,
  date,
  startTime,
  endTime,
  onClose
}) => {
  const formattedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Check className="h-10 w-10 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Agendamento Confirmado!</h2>
          <p className="text-muted-foreground">
            Olá {clientName}, seu agendamento foi confirmado.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start">
            <div className="bg-primary/10 p-1.5 rounded mr-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">{professional.profession}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary/10 p-1.5 rounded mr-3">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{formattedDate}</p>
              <p className="text-sm text-muted-foreground">{startTime} - {endTime}</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-center text-muted-foreground">
          Uma confirmação foi enviada para seu email.
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6">
        <Button onClick={onClose}>
          Concluir
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingConfirmation;
