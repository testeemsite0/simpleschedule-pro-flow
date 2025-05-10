
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional } from '@/types';
import { UnifiedBookingForm } from './UnifiedBookingForm';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { ErrorHandler } from '@/components/ui/error-handler';

interface BookingContentProps {
  professional: Professional;
}

const BookingContent: React.FC<BookingContentProps> = ({ professional }) => {
  const { isLoading, error, resetBooking } = useUnifiedBooking();
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-center">Carregando informações de agendamento...</p>
            <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <ErrorHandler
            error={error}
            resetError={resetBooking}
            title="Erro no sistema de agendamento"
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Agendar com {professional.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <UnifiedBookingForm 
          title={`Agendar com ${professional.name}`}
          key={`booking-form-${professional.id}`}
        />
      </CardContent>
    </Card>
  );
};

export default BookingContent;
