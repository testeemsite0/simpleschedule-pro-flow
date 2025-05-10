
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingData } from '@/hooks/booking/useBookingSteps';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface ConfirmationStepProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingData,
  onConfirm,
  onEdit,
  isLoading = false
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3 mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Confirmar agendamento</h2>
        <p className="text-muted-foreground text-center">
          Revise os detalhes abaixo e confirme seu agendamento
        </p>
      </div>

      <Card className="p-5 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Data</h3>
              <p>{bookingData.date ? formatDate(bookingData.date) : 'Não selecionado'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Horário</h3>
              <p>{bookingData.startTime || 'Não selecionado'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Nome</h3>
              <p>{bookingData.clientName || 'Não informado'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
              <p>{bookingData.clientEmail || 'Não informado'}</p>
            </div>
            {bookingData.clientPhone && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Telefone</h3>
                <p>{bookingData.clientPhone}</p>
              </div>
            )}
            {bookingData.notes && (
              <div className="col-span-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Observações</h3>
                <p className="whitespace-pre-wrap">{bookingData.notes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={isLoading}
          className="order-2 sm:order-1"
        >
          Editar informações
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 order-1 sm:order-2"
        >
          {isLoading ? 'Agendando...' : 'Confirmar agendamento'}
        </Button>
      </div>
    </div>
  );
};
