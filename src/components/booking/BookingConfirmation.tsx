
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Professional } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BookingConfirmationProps {
  professional: Professional;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  appointmentId?: string;
  onClose: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  professional,
  clientName,
  date,
  startTime,
  endTime,
  appointmentId,
  onClose,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const formattedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  
  const handleCancelAppointment = async () => {
    if (!appointmentId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o agendamento para cancelamento",
        variant: "destructive"
      });
      return;
    }
    
    setIsCancelling(true);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso"
      });
      
      setIsDialogOpen(false);
      // Reload the page or navigate back
      navigate(`/booking/${professional.slug}`);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Erro no cancelamento",
        description: "Não foi possível cancelar o agendamento",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto text-center">
      <div className="p-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Agendamento Confirmado!</h2>
        
        <div className="mb-6 text-left">
          <div className="mb-4">
            <p className="text-gray-600">Profissional</p>
            <p className="font-medium">{professional.name}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">Cliente</p>
            <p className="font-medium">{clientName}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">Data</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Horário</p>
            <p className="font-medium">{startTime} - {endTime}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {appointmentId && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  Cancelar Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Agendamento</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja cancelar seu agendamento?
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Voltar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BookingConfirmation;
