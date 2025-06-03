
import React from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { UnifiedBookingForm } from '@/components/booking/UnifiedBookingForm';
import { usePublicProfessionalData } from '@/hooks/booking/usePublicProfessionalData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';

const Booking = () => {
  const { slug } = useParams<{ slug: string }>();
  const { professional, isLoading, error } = usePublicProfessionalData(slug || '');

  console.log('Booking page: Loading state:', { slug, professional, isLoading, error });

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando sistema de agendamento...</p>
              <p className="mt-2 text-sm text-gray-500">Aguarde enquanto buscamos os dados do profissional</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Sistema de Agendamento Indisponível
              </h1>
              <p className="text-gray-600 mb-4">
                {error || 'Não foi possível carregar o sistema de agendamento.'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Por favor, verifique o link ou entre em contato diretamente para agendar.
              </p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Get display name from professional data - use display_name if available, otherwise name
  const displayName = professional.name; // This now comes from display_name or name in the hook

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Agendar com {displayName}
            </h1>
            <p className="text-gray-600 mb-4">{professional.profession}</p>
            
            {professional.bio && (
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                {professional.bio}
              </p>
            )}
            
            <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Agendamento Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Confirmação Imediata</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <Card className="p-6">
            <UnifiedBookingProvider 
              professionalSlug={slug}
              professionalId={professional.id}
              isAdminView={false}
              key={`booking-provider-${professional.id}-${slug}`}
            >
              <UnifiedBookingForm 
                showStepIndicator={true}
                isAdminView={false}
              />
            </UnifiedBookingProvider>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
