
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Professional } from '@/types';
import { UnifiedBookingForm } from './UnifiedBookingForm';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { useUnifiedBooking } from '@/context/UnifiedBookingContext';
import { ErrorHandler } from '@/components/ui/error-handler';

interface BookingContentProps {
  professional: Professional;
}

const BookingContent: React.FC<BookingContentProps> = ({ professional }) => {
  // We need to wrap UnifiedBookingForm with UnifiedBookingProvider
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Agendar com {professional.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <UnifiedBookingProvider professionalId={professional.id} key={`booking-provider-${professional.id}`}>
          <UnifiedBookingFormWrapper 
            title={`Agendar com ${professional.name}`}
            professional={professional}
          />
        </UnifiedBookingProvider>
      </CardContent>
    </Card>
  );
};

// Separate component that can safely use useUnifiedBooking inside the provider
const UnifiedBookingFormWrapper: React.FC<{
  title: string;
  professional: Professional;
}> = ({ title, professional }) => {
  const { isLoading, error, resetBooking } = useUnifiedBooking();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-center">Carregando informações de agendamento...</p>
        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    // Fix: Handle both string and Error types properly
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Erro desconhecido';
    
    return (
      <ErrorHandler
        error={errorMessage}
        resetError={resetBooking}
        title="Erro no sistema de agendamento"
      />
    );
  }
  
  return (
    <UnifiedBookingForm 
      title={title}
      key={`booking-form-${professional.id}`}
    />
  );
};

export default BookingContent;
