
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BookingProvider } from '@/context/BookingContext';
import { useBookingData } from '@/hooks/useBookingData';
import BookingContent from '@/components/booking/BookingContent';
import BookingLoadingState from '@/components/booking/BookingLoadingState';
import { useBooking } from '@/context/BookingContext';

// Intermediate component that depends on the BookingContext
const BookingContainer: React.FC = () => {
  const { loading } = useBooking();
  const { slug } = useParams<{ slug: string }>();
  
  // Initialize data fetching
  useBookingData(slug);
  
  return (
    <main className="flex-1 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {loading ? <BookingLoadingState /> : <BookingContent />}
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
