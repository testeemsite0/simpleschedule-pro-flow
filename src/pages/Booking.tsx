
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import BookingContent from '@/components/booking/BookingContent';
import BookingLoadingState from '@/components/booking/BookingLoadingState';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePublicProfessionalData } from '@/hooks/booking/usePublicProfessionalData';
import { ErrorHandler } from '@/components/ui/error-handler';

const Booking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { professional, loading, error, retry } = usePublicProfessionalData(slug);
  // Track if we've already attempted to render with the professional data
  const [hasAttemptedRender, setHasAttemptedRender] = useState(false);
  
  // Update the hasAttemptedRender flag when professional data arrives
  useEffect(() => {
    if (!loading && (professional || error)) {
      setHasAttemptedRender(true);
    }
  }, [loading, professional, error]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          {loading && !hasAttemptedRender && <BookingLoadingState />}
          
          {error && (
            <ErrorHandler 
              error={error}
              retryAction={retry}
              title="Erro ao carregar dados do profissional"
            />
          )}
          
          {professional && (
            <UnifiedBookingProvider 
              professionalId={professional.id} 
              key={`provider-${professional.id}`}
            >
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
