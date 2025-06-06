
import React from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { UnifiedBookingForm } from '@/components/booking/UnifiedBookingForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ImprovedLoading } from '@/components/ui/improved-loading';

const PublicBooking = () => {
  const { professionalId } = useParams<{ professionalId: string }>();

  console.log('PublicBooking: Rendering with professionalId:', professionalId);

  if (!professionalId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Página não encontrada
            </h1>
            <p className="text-gray-600">
              O link de agendamento não é válido.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agendar consulta
            </h1>
            <p className="text-gray-600">
              Selecione o profissional, data e horário para seu agendamento.
            </p>
          </div>

          <UnifiedBookingProvider 
            professionalId={professionalId}
            isAdminView={false}
          >
            <React.Suspense 
              fallback={
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <ImprovedLoading 
                    variant="form" 
                    message="Carregando formulário de agendamento..."
                  />
                </div>
              }
            >
              <div className="bg-white rounded-lg shadow-sm border">
                <UnifiedBookingForm />
              </div>
            </React.Suspense>
          </UnifiedBookingProvider>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicBooking;
