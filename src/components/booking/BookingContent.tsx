
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Professional } from '@/types';
import { UnifiedBookingForm } from './UnifiedBookingForm';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';

interface BookingContentProps {
  professional: Professional;
}

const BookingContent: React.FC<BookingContentProps> = ({ professional }) => {
  const { isLoading, error } = useUnifiedBooking();
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center py-8">Carregando informações de agendamento...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
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
        <UnifiedBookingForm title={`Agendar com ${professional.name}`} />
      </CardContent>
    </Card>
  );
};

export default BookingContent;
