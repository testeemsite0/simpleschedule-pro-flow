
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import BookingContent from '@/components/booking/BookingContent';
import BookingLoadingState from '@/components/booking/BookingLoadingState';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePublicProfessionalData } from '@/hooks/booking/usePublicProfessionalData';

// Main component - no intermediate components to prevent unnecessary renders
const Booking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { professional, loading, error } = usePublicProfessionalData(slug);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          {loading && <BookingLoadingState />}
          
          {error && !loading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                {error}
              </div>
            </Alert>
          )}
          
          {professional && !loading && (
            <UnifiedBookingProvider professionalId={professional.id}>
              <BookingContent professional={professional} />
            </UnifiedBookingProvider>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
