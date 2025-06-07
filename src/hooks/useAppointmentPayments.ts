
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentPayment } from '@/types/secretary';
import { toast } from 'sonner';

export const useAppointmentPayments = () => {
  const [loading, setLoading] = useState(false);

  const createPayment = async (paymentData: {
    appointment_id: string;
    amount: number;
    payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'insurance';
    notes?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointment_payments')
        .insert({
          ...paymentData,
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        toast.error('Erro ao registrar pagamento');
        return null;
      }

      toast.success('Pagamento registrado com sucesso');
      return data;
    } catch (error) {
      console.error('Error in createPayment:', error);
      toast.error('Erro ao registrar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentsByAppointment = async (appointmentId: string): Promise<AppointmentPayment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointment_payments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPaymentsByAppointment:', error);
      return [];
    }
  };

  return {
    createPayment,
    getPaymentsByAppointment,
    loading
  };
};
