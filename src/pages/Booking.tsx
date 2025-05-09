
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BookingProvider } from '@/context/BookingContext';
import { useBookingData } from '@/hooks/useBookingData';
import BookingContent from '@/components/booking/BookingContent';
import BookingLoadingState from '@/components/booking/BookingLoadingState';
import { useBooking } from '@/context/BookingContext';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { ErrorHandler } from '@/components/ui/error-handler';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Intermediate component that depends on the BookingContext
const BookingContainer: React.FC = () => {
  const { loading, professional } = useBooking();
  const { slug } = useParams<{ slug: string }>();
  
  // Initialize data fetching
  useBookingData(slug);
  
  if (loading) {
    return <BookingLoadingState />;
  }
  
  if (!professional) {
    return (
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-2">
              Profissional não encontrado. Verifique o link de agendamento.
            </div>
          </Alert>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-1 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <BookingContent />
      </div>
    </main>
  );
};

// Main component wrapper that provides context
const Booking: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BookingProvider>
        <BookingContainer />
      </BookingProvider>
      <Footer />
    </div>
  );
};

export default Booking;
