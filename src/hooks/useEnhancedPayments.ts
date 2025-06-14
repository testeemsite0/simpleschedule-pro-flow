
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentRecord {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'insurance';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  paid_at?: string;
  notes?: string;
  created_at: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  paymentHistory: PaymentRecord[];
}

export const useEnhancedPayments = () => {
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

  const getPaymentSummary = async (appointmentId: string): Promise<PaymentSummary | null> => {
    try {
      const { data, error } = await supabase
        .from('appointment_payments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment summary:', error);
        return null;
      }

      const payments = data || [];
      
      const summary: PaymentSummary = {
        totalPaid: payments
          .filter(p => p.payment_status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        totalPending: payments
          .filter(p => p.payment_status === 'pending')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        totalRefunded: payments
          .filter(p => p.payment_status === 'refunded')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        paymentHistory: payments
      };

      return summary;
    } catch (error) {
      console.error('Error in getPaymentSummary:', error);
      return null;
    }
  };

  const updatePaymentStatus = async (
    paymentId: string, 
    status: 'pending' | 'paid' | 'partial' | 'refunded'
  ) => {
    setLoading(true);
    try {
      const updateData: any = { payment_status: status };
      
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointment_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment status:', error);
        toast.error('Erro ao atualizar status do pagamento');
        return false;
      }

      toast.success('Status do pagamento atualizado');
      return true;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      toast.error('Erro ao atualizar pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentReport = async (professionalId: string, startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('appointment_payments')
        .select(`
          *,
          appointments!inner(
            professional_id,
            client_name,
            date,
            start_time
          )
        `)
        .eq('appointments.professional_id', professionalId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error generating payment report:', error);
        toast.error('Erro ao gerar relatório de pagamentos');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in generatePaymentReport:', error);
      return null;
    }
  };

  return {
    createPayment,
    getPaymentSummary,
    updatePaymentStatus,
    generatePaymentReport,
    loading
  };
};
