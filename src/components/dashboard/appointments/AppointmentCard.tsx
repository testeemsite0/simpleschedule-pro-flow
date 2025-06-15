import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Mail, Phone, MapPin, FileText, X, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Appointment } from '@/types';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/dynamicTimezone';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useUserRoles } from '@/hooks/useUserRoles';
import PaymentModal from '@/components/appointments/PaymentModal';
import { WhatsAppMessageButton } from '@/components/whatsapp/WhatsAppMessageButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppointmentCardProps {
  appointment: Appointment;
  teamMemberName?: string;
  insurancePlanName?: string;
  onCancel?: (id: string) => void;
  onStatusChange?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  teamMemberName,
  insurancePlanName,
  onCancel,
  onStatusChange
}) => {
  const { settings } = useCompanySettings();
  const { canManageProfessional, isSecretary, isProfessional } = useUserRoles();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const timezone = settings?.timezone || 'America/Sao_Paulo';

  // Parse the appointment date properly
  const appointmentDate = new Date(appointment.date);
  
  // Format date using company timezone
  const formattedDate = formatDateInTimezone(appointmentDate, timezone, "dd 'de' MMMM, yyyy");
  
  // Format times using company timezone (times are already in local format)
  const startTime = appointment.start_time;
  const endTime = appointment.end_time;

  const canManageAppointment = canManageProfessional(appointment.professional_id);

  const updateAppointmentStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) {
        console.error('Error updating appointment status:', error);
        toast.error('Erro ao atualizar status do agendamento');
        return;
      }

      toast.success(`Agendamento marcado como ${getStatusLabel(newStatus).toLowerCase()}`);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      toast.error('Erro ao atualizar status do agendamento');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteAppointment = () => {
    setPaymentModalOpen(true);
  };

  const handleNoShow = () => {
    updateAppointmentStatus('no_show');
  };

  const handlePaymentRecorded = () => {
    updateAppointmentStatus('completed');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Agendado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      case 'no_show':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Não Compareceu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      case 'no_show': return 'Não Compareceu';
      default: return status;
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    
    switch (source) {
      case 'client':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Cliente</Badge>;
      case 'manual':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Manual</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const canCancel = appointment.status === 'scheduled' && canManageAppointment;
  const canComplete = appointment.status === 'scheduled' && canManageAppointment;
  const canMarkNoShow = appointment.status === 'scheduled' && canManageAppointment;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Header with status and source badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusBadge(appointment.status)}
                {getSourceBadge(appointment.source)}
              </div>
              <div className="flex items-center gap-2">
                {/* WhatsApp button */}
                {appointment.client_phone && canManageAppointment && (
                  <WhatsAppMessageButton
                    appointment={appointment}
                    professionalName={teamMemberName || 'Profissional'}
                  />
                )}
                
                {canComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompleteAppointment}
                    disabled={updating}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluir
                  </Button>
                )}
                {canMarkNoShow && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNoShow}
                    disabled={updating}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Não Compareceu
                  </Button>
                )}
                {canCancel && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(appointment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{startTime} - {endTime}</span>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-lg">{appointment.client_name}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{appointment.client_email}</span>
                </div>
                {appointment.client_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.client_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional and Service Information */}
            {(teamMemberName || insurancePlanName) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {teamMemberName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Profissional: {teamMemberName}</span>
                  </div>
                )}
                {insurancePlanName && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Convênio: {insurancePlanName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            {appointment.price && (
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    Valor: R$ {Number(appointment.price).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="border-t pt-3 text-sm">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Observações:</span>
                    <p className="text-muted-foreground mt-1">{appointment.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        appointment={appointment}
        onPaymentRecorded={handlePaymentRecorded}
      />
    </>
  );
};

export default AppointmentCard;
