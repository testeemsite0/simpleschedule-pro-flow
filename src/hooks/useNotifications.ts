
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendNotificationParams {
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancelled';
  appointmentId: string;
  clientEmail: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
  notes?: string;
}

export const useNotifications = () => {
  const sendNotification = async (params: SendNotificationParams) => {
    try {
      console.log('Sending notification:', params);
      
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('Erro ao enviar notificação por email');
        return false;
      }

      console.log('Notification sent successfully:', data);
      toast.success('Notificação enviada por email');
      return true;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      toast.error('Erro ao enviar notificação');
      return false;
    }
  };

  const sendAppointmentConfirmation = async (appointment: any, professionalName: string) => {
    return sendNotification({
      type: 'appointment_confirmation',
      appointmentId: appointment.id,
      clientEmail: appointment.client_email,
      clientName: appointment.client_name,
      professionalName,
      date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      time: `${appointment.start_time} - ${appointment.end_time}`,
      notes: appointment.notes
    });
  };

  const sendAppointmentReminder = async (appointment: any, professionalName: string) => {
    return sendNotification({
      type: 'appointment_reminder',
      appointmentId: appointment.id,
      clientEmail: appointment.client_email,
      clientName: appointment.client_name,
      professionalName,
      date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      time: `${appointment.start_time} - ${appointment.end_time}`
    });
  };

  const sendAppointmentCancellation = async (appointment: any, professionalName: string) => {
    return sendNotification({
      type: 'appointment_cancelled',
      appointmentId: appointment.id,
      clientEmail: appointment.client_email,
      clientName: appointment.client_name,
      professionalName,
      date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      time: `${appointment.start_time} - ${appointment.end_time}`
    });
  };

  return {
    sendNotification,
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    sendAppointmentCancellation
  };
};
